// Banco de perguntas revisado do FE QUIZ
// Foram mantidas as perguntas com categoria, enunciado, quatro alternativas
// distintas e índice de resposta válido. Registros incompletos ou duplicados foram removidos.

const RAW = []; // banco geral antigo removido: agora cada série tem seu banco (GRADE_RAW e questions-series.js)

// Banco específico por faixa escolar: 30 questões moderadas e 30 avançadas.
// Cada faixa contém 2 questões de cada uma das 15 categorias do FE QUIZ.
// Estrutura: [categoria, pergunta, alternativas, índice correto, explicação, nível]
const GRADE_RAW = [
  // 6º ao 8º ano — nível moderado
  ["História", "Por que os povos antigos se estabeleceram perto de rios como o Nilo e o Tigre?", ["Porque os rios impediam qualquer tipo de comércio", "Porque ofereciam água e terras férteis para a agricultura", "Porque não existiam animais nessas regiões", "Porque os rios eram usados apenas para construir barcos"], 1, "As cheias dos rios depositavam sedimentos que fertilizavam o solo. A água também era essencial para consumo, criação de animais e irrigação.", "moderada"],
  ["História", "Qual mudança foi uma consequência importante da Revolução Industrial?", ["A substituição das fábricas pelo trabalho exclusivamente rural", "O crescimento das cidades e do trabalho nas fábricas", "O fim imediato das diferenças sociais", "A redução do uso de máquinas na produção"], 1, "A mecanização aumentou a produção e estimulou a expansão das fábricas. Muitas pessoas migraram do campo para as cidades em busca de trabalho.", "moderada"],
  ["Geografia", "O que é escala em um mapa?", ["A relação entre a distância no mapa e a distância real", "A altura das montanhas representadas", "A quantidade de cidades de um país", "A direção em que os rios correm"], 0, "A escala mostra quantas vezes as distâncias reais foram reduzidas para caber no mapa. Ela permite calcular distâncias entre lugares.", "moderada"],
  ["Geografia", "Qual é a principal diferença entre tempo atmosférico e clima?", ["Tempo é observado por décadas; clima muda a cada hora", "Tempo descreve condições momentâneas; clima reúne padrões de muitos anos", "Os dois termos significam exatamente a mesma coisa", "Clima indica apenas a temperatura de um dia"], 1, "Tempo atmosférico é a condição da atmosfera em determinado momento. Clima é o comportamento médio dessas condições observado por longos períodos.", "moderada"],
  ["Brasil", "Qual é a função principal dos três poderes na organização política brasileira?", ["Concentrar todas as decisões no Executivo", "Dividir funções do Estado e estabelecer fiscalização entre eles", "Substituir os governos estaduais", "Organizar somente as eleições municipais"], 1, "Executivo, Legislativo e Judiciário têm funções diferentes. A separação ajuda a evitar a concentração de poder e permite controles recíprocos.", "moderada"],
  ["Brasil", "Por que a região amazônica é importante para o Brasil e para o planeta?", ["Porque não possui diversidade de seres vivos", "Porque abriga grande biodiversidade e participa dos ciclos da água e do carbono", "Porque é a única região brasileira com agricultura", "Porque impede totalmente o aquecimento global"], 1, "A Amazônia abriga inúmeras espécies e armazena carbono. Sua vegetação e seus rios também influenciam a circulação de umidade.", "moderada"],
  ["Ciências", "Em uma cadeia alimentar, qual é o papel dos produtores?", ["Decompor somente restos de animais", "Produzir matéria orgânica, geralmente usando energia da luz", "Alimentar-se de todos os consumidores", "Transformar consumidores em minerais"], 1, "Plantas e algas são produtores porque fabricam matéria orgânica, em geral pela fotossíntese. Essa matéria fornece energia aos demais níveis da cadeia.", "moderada"],
  ["Ciências", "Por que ocorre a alternância entre dia e noite na Terra?", ["Porque a Lua encobre o Sol todos os dias", "Porque a Terra gira em torno do próprio eixo", "Porque o Sol gira ao redor da Terra", "Porque a Terra para de se movimentar à noite"], 1, "A rotação terrestre faz diferentes regiões ficarem voltadas para o Sol ou afastadas dele ao longo de aproximadamente 24 horas.", "moderada"],
  ["Biologia", "Qual estrutura da célula controla a entrada e a saída de substâncias?", ["Membrana plasmática", "Parede do estômago", "Clorofila", "Esqueleto"], 0, "A membrana plasmática envolve a célula e controla de maneira seletiva a passagem de substâncias entre o meio interno e o externo.", "moderada"],
  ["Biologia", "Qual é a principal função dos glóbulos vermelhos do sangue?", ["Combater todos os tipos de vírus diretamente", "Transportar oxigênio pelo corpo", "Produzir hormônios digestivos", "Formar os ossos"], 1, "As hemácias contêm hemoglobina, proteína que se liga ao oxigênio nos pulmões e ajuda a transportá-lo aos tecidos.", "moderada"],
  ["Matemática", "Uma mochila custa R$ 120 e recebe desconto de 25%. Qual é o preço final?", ["R$ 80", "R$ 90", "R$ 95", "R$ 100"], 1, "25% de 120 é 30. Subtraindo o desconto: 120 − 30 = 90 reais.", "moderada"],
  ["Matemática", "Um retângulo tem 8 cm de comprimento e 5 cm de largura. Qual é sua área?", ["13 cm²", "26 cm²", "40 cm²", "80 cm²"], 2, "A área do retângulo é comprimento multiplicado pela largura: 8 × 5 = 40 cm².", "moderada"],
  ["Português", "Na frase 'Embora estivesse cansada, terminou a atividade', a palavra 'embora' indica ideia de:", ["Causa", "Concessão", "Conclusão", "Finalidade"], 1, "'Embora' introduz uma concessão: apresenta uma dificuldade (estar cansada) que não impediu a realização da ação.", "moderada"],
  ["Português", "Em 'Os alunos organizaram a feira', qual termo é o sujeito da oração?", ["Organizaram", "A feira", "Os alunos", "A oração não tem sujeito"], 2, "O sujeito é 'Os alunos', pois é sobre eles que se declara a ação de organizar a feira.", "moderada"],
  ["Literatura", "Qual característica é comum às fábulas?", ["Apresentar apenas dados científicos", "Trazer animais ou objetos personificados e uma moral", "Narrar obrigatoriamente fatos históricos reais", "Ser escrita sempre em versos"], 1, "Fábulas são narrativas curtas que frequentemente atribuem comportamento humano a animais e terminam com uma reflexão ou moral.", "moderada"],
  ["Literatura", "Quem é o narrador-personagem de uma história?", ["Aquele que participa dos acontecimentos e narra em primeira pessoa", "Um leitor que comenta o livro depois do final", "Sempre o autor real da obra", "Um narrador que conhece apenas o futuro"], 0, "O narrador-personagem participa da história e relata os acontecimentos a partir de sua própria experiência, geralmente usando 'eu'.", "moderada"],
  ["Tecnologia", "Por que é importante criar senhas diferentes para contas diferentes?", ["Para facilitar que outras pessoas adivinhem", "Para impedir que o vazamento de uma senha dê acesso a várias contas", "Porque senhas iguais deixam a internet mais lenta", "Para dispensar atualizações de segurança"], 1, "Se uma senha vazar, usar a mesma em vários serviços permite que alguém tente acessar todas essas contas. Senhas únicas reduzem esse risco.", "moderada"],
  ["Tecnologia", "O que significa verificar a fonte antes de compartilhar uma notícia?", ["Conferir quem publicou e buscar confirmação em fontes confiáveis", "Compartilhar primeiro e pesquisar depois", "Acreditar apenas no número de curtidas", "Considerar verdadeira toda mensagem recebida de conhecidos"], 0, "Verificar a autoria, a data, as evidências e a confirmação por fontes independentes ajuda a reduzir a disseminação de desinformação.", "moderada"],
  ["Informática", "Qual é a função principal de um sistema operacional?", ["Somente criar apresentações", "Gerenciar o hardware e permitir a execução de programas", "Substituir a conexão com a internet", "Impedir a instalação de qualquer aplicativo"], 1, "O sistema operacional administra recursos como memória, processador e arquivos, além de oferecer uma interface para executar aplicativos.", "moderada"],
  ["Informática", "Em uma planilha, para que serve uma fórmula que começa com o sinal '='?", ["Indicar que a célula está bloqueada", "Realizar um cálculo ou operação usando valores e referências", "Apagar automaticamente a linha", "Mudar a cor de todas as células"], 1, "O sinal de igual indica que o conteúdo é uma fórmula. Ela pode calcular valores e usar referências a outras células.", "moderada"],
  ["Cultura Geral", "Por que os fusos horários existem?", ["Porque a Terra é plana", "Porque a Terra gira e diferentes longitudes recebem luz solar em horários diferentes", "Porque todos os países têm o mesmo horário solar", "Porque as estações do ano ocorrem ao mesmo tempo em todos os lugares"], 1, "A rotação da Terra faz o Sol atingir diferentes longitudes em momentos distintos. Os fusos organizam os horários civis dessas regiões.", "moderada"],
  ["Cultura Geral", "Qual instituição brasileira é responsável por produzir e divulgar estatísticas oficiais, como dados populacionais?", ["IBGE", "Banco Central", "STF", "Anatel"], 0, "O Instituto Brasileiro de Geografia e Estatística (IBGE) realiza censos e pesquisas que fornecem informações demográficas, sociais e econômicas.", "moderada"],
  ["Esportes", "No basquete, quantos pontos vale uma cesta feita de trás da linha de três pontos?", ["1 ponto", "2 pontos", "3 pontos", "4 pontos"], 2, "Uma cesta convertida de trás da linha de três pontos vale três pontos, desde que o arremessador não cometa uma infração no lance.", "moderada"],
  ["Esportes", "Qual capacidade física está mais diretamente relacionada à possibilidade de manter um esforço por bastante tempo?", ["Resistência", "Flexibilidade", "Equilíbrio estático", "Velocidade de reação apenas"], 0, "A resistência permite sustentar atividades físicas por períodos prolongados, com participação dos sistemas cardiovascular e muscular.", "moderada"],
  ["Artes", "O que caracteriza principalmente uma obra abstrata?", ["Representar sempre pessoas de modo realista", "Priorizar formas, cores e linhas sem precisar imitar objetos reconhecíveis", "Ser obrigatoriamente feita de fotografia", "Não utilizar elementos visuais"], 1, "A arte abstrata pode explorar cores, formas, linhas e texturas sem representar diretamente figuras reconhecíveis do mundo real.", "moderada"],
  ["Artes", "Em uma composição visual, o contraste ajuda a:", ["Tornar todos os elementos idênticos", "Destacar diferenças entre elementos, como claro e escuro", "Eliminar a organização da imagem", "Impedir a percepção das formas"], 1, "O contraste cria diferenças perceptíveis, como entre cores claras e escuras, ajudando a destacar áreas e organizar a composição.", "moderada"],
  ["Meio Ambiente", "Qual atitude contribui diretamente para reduzir o consumo de água em casa?", ["Deixar a torneira aberta ao escovar os dentes", "Consertar vazamentos e fechar a torneira quando não estiver em uso", "Lavar calçadas diariamente com mangueira", "Aumentar o tempo de banho"], 1, "Consertar vazamentos e evitar desperdício reduzem o consumo de água tratada sem prejudicar as atividades essenciais.", "moderada"],
  ["Meio Ambiente", "O que é coleta seletiva?", ["Misturar todos os resíduos no mesmo recipiente", "Separar resíduos por tipo para facilitar reutilização e reciclagem", "Queimar o lixo doméstico", "Descartar materiais recicláveis em rios"], 1, "A coleta seletiva separa materiais como papel, plástico, vidro e metal, facilitando sua triagem, reciclagem e reaproveitamento.", "moderada"],
  ["Curiosidades", "Por que conseguimos ouvir um trovão depois de ver um relâmpago?", ["Porque a luz viaja mais rápido que o som", "Porque o som viaja mais rápido que a luz", "Porque o trovão acontece antes do relâmpago", "Porque o ar bloqueia completamente a luz"], 0, "A luz chega aos olhos quase instantaneamente em comparação com o som, que se propaga muito mais devagar pelo ar.", "moderada"],
  ["Curiosidades", "Qual planeta do Sistema Solar é conhecido por possuir o maior sistema de anéis?", ["Marte", "Saturno", "Mercúrio", "Vênus"], 1, "Saturno possui um sistema de anéis extenso e brilhante, formado principalmente por partículas de gelo, poeira e fragmentos rochosos.", "moderada"],

  // 9º ano e Ensino Médio — nível avançado
  ["História", "Qual relação entre a Revolução Industrial e o imperialismo europeu do século XIX é historicamente mais adequada?", ["A industrialização eliminou a necessidade de matérias-primas externas", "A busca por matérias-primas, mercados consumidores e áreas de investimento estimulou a expansão imperialista", "O imperialismo ocorreu antes da industrialização e não teve relação econômica com ela", "As potências industriais abandonaram a disputa por territórios"], 1, "A expansão industrial aumentou a demanda por matérias-primas e mercados. A competição econômica e estratégica contribuiu para a dominação colonial de regiões da África e da Ásia.", "avancada"],
  ["História", "Na Primeira República brasileira, a política dos governadores ajudou a sustentar o poder das oligarquias porque:", ["Ampliou a participação política de todos os grupos sociais sem restrições", "Articulou o governo federal e as oligarquias estaduais por meio de apoio político e controle eleitoral", "Extinguiu o poder dos grandes proprietários rurais", "Transferiu o comando político exclusivamente aos sindicatos urbanos"], 1, "A política dos governadores estabeleceu alianças entre o presidente e as oligarquias estaduais. O sistema se apoiava em práticas eleitorais controladas e no poder local dos coronéis.", "avancada"],
  ["Geografia", "Uma cidade apresenta expansão urbana periférica, longos deslocamentos e concentração de empregos no centro. Esse quadro está mais associado a:", ["Segregação socioespacial e desigualdade no acesso à cidade", "Ausência de hierarquia urbana", "Desconcentração completa das atividades econômicas", "Eliminação da mobilidade pendular"], 0, "A segregação socioespacial distribui grupos sociais e oportunidades de forma desigual no espaço. A distância entre moradia e emprego aumenta deslocamentos cotidianos.", "avancada"],
  ["Geografia", "Por que a latitude, isoladamente, não explica toda a variação climática de uma região?", ["Porque altitude, relevo, maritimidade, correntes marítimas e massas de ar também interferem no clima", "Porque a latitude só influencia a vegetação, nunca a temperatura", "Porque regiões na mesma latitude sempre possuem o mesmo clima", "Porque o clima depende exclusivamente da longitude"], 0, "A latitude influencia a incidência solar, mas fatores geográficos e atmosféricos modificam temperatura e umidade, produzindo diferenças entre lugares de latitudes semelhantes.", "avancada"],
  ["Brasil", "A Constituição Federal de 1988 é frequentemente chamada de Constituição Cidadã porque:", ["Restringiu direitos sociais e políticos", "Ampliou o reconhecimento de direitos e garantias fundamentais após a ditadura militar", "Substituiu eleições por indicações permanentes", "Eliminou a autonomia dos municípios"], 1, "Promulgada durante a redemocratização, a Constituição de 1988 ampliou direitos civis, políticos e sociais e estabeleceu garantias fundamentais.", "avancada"],
  ["Brasil", "O processo de desconcentração industrial no Brasil, intensificado em diferentes momentos desde o fim do século XX, envolve:", ["A transferência de parte das atividades produtivas para outras regiões e cidades, influenciada por custos, infraestrutura e incentivos", "A concentração obrigatória de todas as fábricas na capital paulista", "O desaparecimento da indústria de transformação", "A proibição de incentivos fiscais estaduais"], 0, "Empresas passaram a instalar unidades em outras regiões em busca de custos menores, infraestrutura, mercados e incentivos, embora importantes concentrações industriais permaneçam.", "avancada"],
  ["Ciências", "Em um circuito elétrico simples, mantendo a tensão constante, o que acontece com a corrente se a resistência elétrica total aumenta?", ["A corrente aumenta proporcionalmente", "A corrente diminui, conforme a relação entre tensão, resistência e corrente", "A corrente permanece sempre igual", "A corrente se transforma em tensão"], 1, "Pela Lei de Ohm, I = V/R. Com tensão constante, aumentar a resistência reduz a corrente elétrica.", "avancada"],
  ["Ciências", "Uma solução tem pH 3 e outra tem pH 5. Considerando a escala de pH, a primeira apresenta concentração de íons H⁺ aproximadamente:", ["Duas vezes maior", "Dez vezes maior", "Cem vezes maior", "Mil vezes menor"], 2, "Cada unidade de pH representa uma variação de dez vezes na concentração de H⁺. Uma diferença de duas unidades corresponde a 10², ou cem vezes.", "avancada"],
  ["Biologia", "Em uma população em equilíbrio de Hardy-Weinberg, as frequências dos alelos permanecem constantes quando:", ["Há seleção natural intensa e migração contínua", "Ocorrem acasalamentos não aleatórios e mutações frequentes", "Não há seleção, mutação ou migração relevantes, a população é grande e os cruzamentos são aleatórios", "A população sofre deriva genética intensa"], 2, "O modelo de Hardy-Weinberg pressupõe população muito grande, cruzamentos aleatórios e ausência de seleção, mutação e migração. Nessas condições, as frequências alélicas permanecem estáveis.", "avancada"],
  ["Biologia", "Durante a respiração celular aeróbica, a maior parte do ATP é produzida diretamente em qual etapa?", ["Glicólise", "Ciclo de Calvin", "Fosforilação oxidativa na cadeia transportadora de elétrons", "Fermentação lática"], 2, "Na respiração aeróbica, a cadeia transportadora de elétrons cria um gradiente de prótons usado pela ATP sintase, produzindo a maior parte do ATP.", "avancada"],
  ["Matemática", "Uma função afim passa pelos pontos (2, 7) e (5, 16). Qual é sua lei de formação?", ["f(x) = 2x + 3", "f(x) = 3x + 1", "f(x) = 4x − 1", "f(x) = x + 5"], 1, "O coeficiente angular é (16 − 7)/(5 − 2) = 3. Usando 7 = 3·2 + b, obtemos b = 1; logo, f(x) = 3x + 1.", "avancada"],
  ["Matemática", "Uma urna contém 4 bolas vermelhas e 6 azuis. Duas bolas são retiradas, sem reposição. Qual é a probabilidade de ambas serem vermelhas?", ["2/15", "4/25", "1/5", "4/15"], 0, "A probabilidade é (4/10) × (3/9) = 12/90 = 2/15. A segunda retirada tem apenas três bolas vermelhas entre nove restantes.", "avancada"],
  ["Português", "No período 'O projeto foi aprovado, embora apresentasse falhas', a oração introduzida por 'embora' expressa:", ["Uma causa que explica a aprovação", "Uma concessão que contrasta com a oração principal", "Uma condição indispensável à aprovação", "Uma consequência necessária da aprovação"], 1, "A oração concessiva apresenta um fato contrário à expectativa: mesmo apresentando falhas, o projeto foi aprovado.", "avancada"],
  ["Português", "Em 'É necessário que todos participem', a oração 'que todos participem' exerce função de:", ["Oração subordinada substantiva subjetiva", "Oração subordinada adverbial causal", "Oração subordinada adjetiva explicativa", "Oração coordenada sindética adversativa"], 0, "A oração subordinada funciona como sujeito da expressão 'é necessário'. Pode-se perguntar: o que é necessário? Que todos participem.", "avancada"],
  ["Literatura", "No Modernismo brasileiro de 1922, uma das propostas centrais da primeira fase foi:", ["Retomar rigorosamente os padrões parnasianos", "Romper com modelos acadêmicos e explorar linguagem e temas ligados à realidade brasileira", "Imitar exclusivamente a literatura clássica portuguesa", "Abandonar qualquer experimentação formal"], 1, "A primeira fase modernista valorizou a ruptura estética, a linguagem coloquial, a experimentação e a reflexão crítica sobre a identidade cultural brasileira.", "avancada"],
  ["Literatura", "Em uma narrativa, o fluxo de consciência é um recurso que procura:", ["Registrar apenas diálogos objetivos", "Representar o movimento dos pensamentos e associações internas de uma personagem", "Eliminar a perspectiva subjetiva", "Organizar os fatos exclusivamente em ordem cronológica"], 1, "O fluxo de consciência aproxima o leitor da experiência mental da personagem, reproduzindo pensamentos, lembranças e associações nem sempre lineares.", "avancada"],
  ["Tecnologia", "Em segurança digital, o que caracteriza um ataque de phishing?", ["Uma tentativa de enganar a vítima para obter dados ou induzi-la a executar uma ação", "Um método legítimo de criptografia de arquivos", "Uma atualização automática do sistema operacional", "Uma técnica física de resfriamento de servidores"], 0, "Phishing usa mensagens ou páginas falsas para se passar por entidades confiáveis e obter senhas, dados financeiros ou outras informações.", "avancada"],
  ["Tecnologia", "Qual é a principal vantagem do uso de autenticação multifator (MFA)?", ["Tornar desnecessária qualquer senha", "Adicionar uma segunda ou outra evidência de identidade além da senha", "Permitir que todos usem a mesma conta", "Impedir a necessidade de atualizar sistemas"], 1, "A MFA exige mais de um fator de autenticação, dificultando o acesso indevido mesmo quando uma senha é descoberta ou vazada.", "avancada"],
  ["Informática", "Em bancos de dados relacionais, qual é a finalidade de uma chave estrangeira?", ["Identificar exclusivamente cada linha da própria tabela, sem relação externa", "Criar uma relação entre registros de tabelas e ajudar a manter a integridade referencial", "Criptografar automaticamente todos os campos", "Substituir todos os índices do banco"], 1, "A chave estrangeira referencia uma chave candidata, geralmente primária, de outra tabela e ajuda a impedir referências a registros inexistentes.", "avancada"],
  ["Informática", "Qual alternativa descreve corretamente a diferença entre compilador e interpretador, de forma geral?", ["O compilador traduz o programa antes da execução; o interpretador executa instruções por meio de um ambiente de interpretação", "O interpretador só funciona sem sistema operacional", "O compilador é sempre uma linguagem de programação", "Ambos são dispositivos físicos de armazenamento"], 0, "Em termos gerais, um compilador traduz o código para outra representação antes da execução, enquanto um interpretador executa o programa por meio de um ambiente que processa suas instruções.", "avancada"],
  ["Cultura Geral", "O conceito de inflação corresponde principalmente:", ["À queda contínua do nível geral de preços", "Ao aumento persistente do nível geral de preços, reduzindo o poder de compra da moeda", "Ao aumento isolado do preço de um único produto", "À valorização obrigatória de todas as moedas estrangeiras"], 1, "Inflação é o aumento persistente e disseminado dos preços. Com a mesma quantidade de dinheiro, em geral, compra-se uma quantidade menor de bens e serviços.", "avancada"],
  ["Cultura Geral", "Em uma pesquisa por amostragem, por que a seleção dos participantes deve evitar vieses?", ["Para garantir que todos respondam da mesma maneira", "Para reduzir distorções e tornar a amostra mais representativa da população estudada", "Para eliminar a necessidade de analisar os dados", "Para aumentar artificialmente o tamanho da população"], 1, "Vieses de seleção podem fazer certos grupos ficarem super ou sub-representados, distorcendo estimativas e conclusões sobre a população.", "avancada"],
  ["Esportes", "No treinamento esportivo, o princípio da sobrecarga progressiva significa:", ["Aumentar a exigência de forma planejada conforme a adaptação do organismo", "Manter sempre a mesma carga, independentemente da evolução", "Treinar até a exaustão em todas as sessões", "Eliminar os períodos de recuperação"], 0, "A sobrecarga progressiva aumenta gradualmente o estímulo para promover adaptação. A progressão deve considerar capacidade, técnica e recuperação.", "avancada"],
  ["Esportes", "No voleibol, uma equipe pode dar no máximo quantos toques na bola antes de enviá-la ao outro lado, desconsiderando o contato de bloqueio?", ["Dois", "Três", "Quatro", "Cinco"], 1, "A equipe pode realizar até três toques para devolver a bola. O contato de bloqueio não conta como um desses três toques.", "avancada"],
  ["Artes", "Na análise de uma obra, o conceito de contexto histórico-cultural permite:", ["Ignorar as condições em que a obra foi produzida", "Relacionar escolhas estéticas às ideias, conflitos e condições sociais de sua época", "Definir que toda obra possui apenas um significado fixo", "Avaliar somente o preço de mercado da obra"], 1, "O contexto histórico-cultural ajuda a interpretar como valores, conflitos, técnicas e condições sociais influenciam a produção e a recepção artística.", "avancada"],
  ["Artes", "Na perspectiva linear, a sensação de profundidade é construída principalmente por meio de:", ["Linhas convergentes para um ou mais pontos de fuga", "Uso exclusivo de cores primárias", "Ausência de proporção entre os objetos", "Repetição de formas sem relação espacial"], 0, "A perspectiva linear representa a diminuição aparente de objetos e a convergência de linhas paralelas em pontos de fuga, criando ilusão de profundidade.", "avancada"],
  ["Meio Ambiente", "A eutrofização de um lago é frequentemente provocada pelo excesso de:", ["Oxigênio dissolvido produzido por peixes", "Nutrientes, especialmente nitrogênio e fósforo, que favorecem a proliferação de algas", "Areia transportada pelo vento", "Luz solar refletida pela superfície"], 1, "O excesso de nutrientes, muitas vezes vindo de esgoto e fertilizantes, estimula florações de algas. Sua decomposição pode reduzir o oxigênio da água e prejudicar organismos aquáticos.", "avancada"],
  ["Meio Ambiente", "Por que a perda de biodiversidade pode comprometer a estabilidade de um ecossistema?", ["Porque reduz interações ecológicas e pode diminuir a capacidade de o sistema responder a perturbações", "Porque impede qualquer forma de evolução", "Porque faz todas as espécies restantes ocuparem o mesmo nicho", "Porque elimina automaticamente os fatores abióticos"], 0, "A diversidade de espécies sustenta redes alimentares e funções ecológicas. Sua redução pode tornar o ecossistema mais vulnerável a doenças, mudanças ambientais e outras perturbações.", "avancada"],
  ["Curiosidades", "Por que o céu costuma parecer azul durante o dia?", ["Porque o oceano reflete sua cor na atmosfera", "Porque moléculas do ar espalham mais intensamente os comprimentos de onda menores da luz solar", "Porque a luz azul é produzida pelas nuvens", "Porque a atmosfera absorve toda a luz vermelha e não espalha nenhuma outra"], 1, "O espalhamento de Rayleigh é mais intenso para comprimentos de onda menores. A luz azul é espalhada em várias direções pela atmosfera e chega aos nossos olhos.", "avancada"],
  ["Curiosidades", "Se a massa de um objeto permanecer constante e a força resultante sobre ele dobrar, o que ocorre com sua aceleração, de acordo com a segunda lei de Newton?", ["Cai pela metade", "Permanece igual", "Dobra", "Quadruplica"], 2, "Pela segunda lei de Newton, F = m·a. Mantendo a massa constante, dobrar a força resultante dobra a aceleração.", "avancada"]
];

/*
 * Explicações contextualizadas por questão.
 * O texto é montado a partir do enunciado, da categoria e da alternativa correta,
 * evitando repetir a mesma mensagem genérica em todas as perguntas.
 */
function explicarQuestao(r) {
  const [categoria, pergunta, alternativas, indice] = r;
  const resposta = String(alternativas[indice]);
  const enunciado = String(pergunta).replace(/[?!.]+$/, "").trim();
  const tema = enunciado
    .replace(/^(qual|quem|quando|onde|quant[oa]s?|em que|em qual|que|como|por que)\s+/i, "")
    .replace(/^(é|foi|era|ocorreu|aconteceu)\s+/i, "")
    .trim();

  // Explicações de cálculo mais comuns no banco.
  if (categoria === "Matemática") {
    const decimal = enunciado.match(/fração equivalente a\s*([0-9]+(?:[,.][0-9]+)?)/i);
    if (decimal) {
      const valor = decimal[1].replace(",", ".");
      if (valor === "0.5") {
        return `0,5 representa cinco décimos (5/10). Simplificando numerador e denominador por 5, obtemos 1/2. Por isso, ${resposta} é a fração equivalente.`;
      }
      if (valor === "0.25") {
        return `0,25 representa vinte e cinco centésimos (25/100). Simplificando por 25, obtemos 1/4. Por isso, ${resposta} é a fração equivalente.`;
      }
      if (valor === "0.75") {
        return `0,75 representa setenta e cinco centésimos (75/100). Simplificando por 25, obtemos 3/4. Por isso, ${resposta} é a fração equivalente.`;
      }
    }
    return `Em Matemática, é importante identificar a operação ou propriedade indicada no enunciado. Neste caso, ${resposta} é o resultado que corresponde ao que foi pedido: “${enunciado}”.`;
  }

  const explicacoes = {
    "História": `A resposta é ${resposta}. Esse dado ajuda a localizar o acontecimento, personagem ou processo no contexto histórico perguntado: “${enunciado}”.`,
    "Geografia": `${resposta} é a informação geográfica solicitada. Para compreender esse tipo de questão, relacione o lugar ou fenômeno às suas características e localização.`,
    "Brasil": `${resposta} responde ao aspecto da história, da sociedade ou da organização do Brasil indicado no enunciado. Esse contexto ajuda a entender a formação do país.`,
    "Ciências": `${resposta} corresponde ao conceito científico pedido. A questão verifica a relação entre esse conceito e o fenômeno descrito no enunciado.`,
    "Biologia": `${resposta} é a alternativa correta porque identifica o ser vivo, estrutura ou processo biológico solicitado. Esse conceito está relacionado ao funcionamento dos organismos.`,
    "Português": `${resposta} corresponde ao conceito de língua ou gramática solicitado. Para resolver questões desse tipo, observe a função da palavra e o contexto em que ela aparece.`,
    "Literatura": `${resposta} identifica a obra, autor ou característica literária pedida. Relacionar essa informação ao contexto da produção literária ajuda a compreender a questão.`,
    "Tecnologia": `${resposta} é o recurso ou conceito tecnológico que corresponde ao enunciado. A ideia central é reconhecer sua finalidade e como ela é aplicada.`,
    "Informática": `${resposta} é o termo de informática que atende ao que foi perguntado. Entender sua função ajuda a distinguir esse recurso de outras ferramentas digitais.`,
    "Cultura Geral": `${resposta} é a informação que corresponde ao tema de cultura geral apresentado. A questão exige reconhecer esse fato e relacioná-lo ao contexto indicado.`,
    "Esportes": `${resposta} corresponde à regra, modalidade ou informação esportiva solicitada. Conhecer esse detalhe ajuda a compreender como a modalidade funciona.`,
    "Artes": `${resposta} identifica o artista, movimento, obra ou conceito artístico solicitado. Essa informação permite relacionar a produção artística ao seu contexto.`,
    "Meio Ambiente": `${resposta} corresponde ao conceito ambiental perguntado. Compreender essa relação ajuda a reconhecer os impactos e os processos que envolvem o meio ambiente.`,
    "Curiosidades": `${resposta} é o fato que responde diretamente à curiosidade apresentada. O detalhe importante é relacionar essa informação ao assunto específico da pergunta.`
  };
  return explicacoes[categoria] || `${resposta} é a alternativa que responde ao enunciado “${enunciado}”.`;
}

const questions = [
  ...RAW.map((r, i) => ({
    id: i + 1,
    categoria: r[0],
    pergunta: r[1],
    alternativas: r[2],
    resposta: r[3],
    explicacao: explicarQuestao(r),
    nivel: "geral"
  })),
  ...GRADE_RAW.map((r, i) => ({
    id: RAW.length + i + 1,
    categoria: r[0],
    pergunta: r[1],
    alternativas: r[2],
    resposta: r[3],
    explicacao: r[4],
    nivel: r[5]
  }))
];

const QUESTION_CATEGORIES = [...new Set(questions.map((q) => q.categoria))];

const invalidQuestions = questions.filter((q) =>
  !q.categoria ||
  !q.pergunta ||
  !Array.isArray(q.alternativas) ||
  q.alternativas.length !== 4 ||
  new Set(q.alternativas.map((a) => String(a).trim().toLocaleLowerCase("pt-BR"))).size !== 4 ||
  !Number.isInteger(q.resposta) ||
  q.resposta < 0 ||
  q.resposta > 3
);

if (invalidQuestions.length) {
  console.error("FE QUIZ: perguntas inválidas encontradas:", invalidQuestions);
}

console.info(
  `FE QUIZ: ${questions.length} perguntas válidas em ${QUESTION_CATEGORIES.length} categorias.`
);
