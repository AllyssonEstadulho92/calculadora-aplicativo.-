# Rota & Conta 1.2.0

Comparador pessoal de preços de viagens Uber e Bolt, com distância rodoviária calculada a partir das moradas, sugestão contextual e histórico financeiro. Interface em português de Portugal para iPhone e computador.

**Não recolhe preços das plataformas automaticamente.** Introduz valores reais observados nas aplicações, que podem alterar-se a qualquer momento. A distância é uma estimativa de mapa e **não permite calcular a tarifa exata** da Uber ou Bolt.

## Iniciar

Sem instalação de dependências. Necessita de um servidor HTTP local para suportar os módulos JavaScript:

```sh
python3 -m http.server 8080
```

Abre `http://localhost:8080` no navegador, a partir desta pasta. Em HTTPS, a PWA pode funcionar offline depois da primeira visita.

No iPhone, abre a versão alojada em **Safari**, usa **Partilhar > Adicionar ao ecrã principal** e confirma. O acesso offline depende de uma primeira visita online e da gestão de armazenamento do iOS.

## Como usar

1. Confirma partida e destino. Para obter uma rota mais precisa, escreve rua, número de porta e localidade. O botão **Confirmar e calcular percurso** consulta automaticamente quilómetros e duração, sem outro passo. Se uma localização for ambígua, a aplicação avisa.
2. Usa a secção **Ver o preço na origem** para abrir Uber, Bolt ou Moovit. A abertura não transfere as moradas para estas aplicações nem recolhe as suas cotações. Podes copiar as moradas para as colar na plataforma escolhida. O Moovit destina-se a transportes públicos, não fornece uma cotação TVDE.
3. Regista os preços que as aplicações oficiais apresentam, incluindo intervalos ou descontos quando aplicáveis.
4. A recomendação distingue menor custo máximo de menor espera até à recolha. Só usa ofertas com menos de cinco minutos.
5. Introduz quantas viagens pretendes fazer no mês e calcula a simulação de custo e o custo equivalente por km do preço registado.
6. Regista a viagem como planeada ou, depois de concluída, o preço final pago. Só os registos pagos entram no relatório.
7. Exporta dados para CSV e descarrega backups JSON regularmente.

Os exemplos das capturas de referência não estão incorporados na aplicação. Não inclui moradas privadas em código público.

## Testes

```sh
node --test tests/*.test.mjs
node --check src/app.mjs
```

## Limitações e segurança

- Sem API oficial de preço/viagens, localização GPS, leitura automática de capturas ou cartografia dentro da aplicação.
- Os links externos para Uber, Bolt e Moovit são acessos diretos às fontes oficiais, **não são integração de preços nem transferem automaticamente as moradas**. Não é possível garantir cotações individualizadas sem autorização técnica das plataformas. A secção de recomendações só compara valores que o utilizador registou.
- O serviço [My Geocode](https://www.mygeocode.com/terms/) recebe as moradas ao confirmares o percurso ou pedires a atualização. As coordenadas são enviadas ao [servidor de demonstração OSRM](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server) para calcular o percurso. Estes serviços são independentes das plataformas, têm limites de utilização e não garantem disponibilidade ou exatidão. Não há trânsito em tempo real. Não introduzas dados confidenciais desnecessários.
- A distância pode diferir da rota escolhida pelo motorista e não determina o preço da Uber/Bolt. O botão de mapa abre o Google Maps para confirmação visual.
- O histórico financeiro e o último cálculo de percurso são armazenados localmente neste navegador em `localStorage`. **Não há conta, nuvem ou sincronização entre dispositivos.** Limpar os dados do Safari pode eliminar o histórico, por isso exporta backup. As chamadas externas para mapas ocorrem quando confirmas ou atualizas o percurso.
- A imagem de uma captura só é pré-visualizada para ajudar a copiar os valores. Não fica guardada.
- O projeto é independente e não afiliado à Uber ou Bolt.

Mais informação: [Especificação](docs/PROJECT_SPEC.md), [Arquitetura](docs/ARCHITECTURE.md), [Estado atual](docs/PROJECT_STATE.md), [Decisões](docs/DECISIONS.md), [Tarefas](docs/TODO.md), [Changelog](docs/CHANGELOG.md).
