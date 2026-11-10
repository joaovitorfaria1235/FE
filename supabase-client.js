/* Camada de integração online do FE QUIZ. */
(() => {
  const cfg = window.FE_QUIZ_SUPABASE;
  const status = (message, error = false) => {
    const el = document.getElementById('cloudStatus');
    if (el) { el.textContent = message; el.classList.toggle('err', error); }
  };
  if (!cfg || !window.supabase?.createClient) {
    window.FEQuizCloud = { enabled: false, ready: Promise.resolve(false), refresh: async () => false, submit: async () => false };
    status('Modo local: não foi possível carregar a conexão online.', true);
    return;
  }
  const client = window.supabase.createClient(cfg.url, cfg.key);
  window.FEQuizSupabase = client;

  // O link administrativo só aparece para uma sessão autenticada
  // cujo UUID esteja cadastrado em fequiz_admin_users. A segurança real
  // continua sendo aplicada pelas políticas RLS no banco.
  const adminLink = document.getElementById('adminNavLink');
  async function updateAdminLink(session) {
    if (!adminLink) return;
    adminLink.hidden = true;
    if (!session?.user?.id) return;
    try {
      const { data, error } = await client
        .from('fequiz_admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!error && data?.user_id === session.user.id) adminLink.hidden = false;
    } catch (error) {
      console.warn('Não foi possível verificar o acesso administrativo:', error);
    }
  }

  client.auth.getSession().then(({ data }) => updateAdminLink(data?.session));
  client.auth.onAuthStateChange((_event, session) => {
    // Não bloqueia o callback interno de autenticação do Supabase.
    Promise.resolve().then(() => updateAdminLink(session));
  });
  let online = false;
  const api = {
    enabled: true,
    ready: null,
    async refresh() {
      try {
        const { data, error } = await client.from('quiz_participants').select('id,name,grade,total_points').order('total_points', { ascending: false });
        if (error) throw error;
        if (Array.isArray(data)) {
          const old = JSON.parse(localStorage.getItem('quizEventoV1') || '{"participants":[],"match":null}');
          old.participants = data.map(p => ({ id: Number(p.id), name: p.name, grade: p.grade, points: Number(p.total_points || 0) }));
          localStorage.setItem('quizEventoV1', JSON.stringify(old));
          if (window.FEQuizSetParticipants) window.FEQuizSetParticipants(old.participants);
          online = true;
          status('Ranking online conectado · dados compartilhados entre dispositivos.');
          return true;
        }
      } catch (e) {
        console.error('Falha ao atualizar ranking online:', e);
        status('Não foi possível carregar o ranking online. Confira se o SQL de configuração foi executado.', true);
      }
      return false;
    },
    // Pergunta ao banco se este nome + série ainda pode jogar (regra de participação única).
    async canPlay(name, grade) {
      const { data, error } = await client.rpc('fequiz_can_play', { p_name: name, p_grade: grade });
      if (error) {
        console.error('Falha em fequiz_can_play:', error);
        throw new Error('Não foi possível verificar a participação. Verifique a conexão e tente novamente.');
      }
      return data === true;
    },
    async submit(result) {
      try {
        const { error } = await client.rpc('fequiz_submit_result', {
          p_match_id: result.matchId,
          p_name: result.name,
          p_grade: result.grade,
          p_points: result.points,
          p_hits: result.hits,
          p_misses: result.misses,
          p_duration_seconds: result.durationSeconds
        });
        if (error) throw error;
        await api.refresh();
        status('Partida salva no ranking online.');
        return true;
      } catch (e) {
        console.error('Falha ao salvar partida online:', e);
        // Se o banco recusou por participação repetida, volta a exibir o ranking real do servidor.
        if (String(e?.message || '').includes('já participou')) await api.refresh();
        status('Partida concluída, mas não foi sincronizada. Verifique a configuração do Supabase.', true);
        return false;
      }
    }
  };
  api.ready = api.refresh();
  window.FEQuizCloud = api;
})();
