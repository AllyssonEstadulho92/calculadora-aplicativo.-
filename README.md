# Rota & Conta 1.0.0

Comparador pessoal de preços de viagens Uber e Bolt, com calculadora de custos, sugestão contextual e histórico financeiro. Interface em português de Portugal para iPhone e computador.

**Não recolhe preços das plataformas automaticamente.** Introduz valores reais observados nas aplicações, que podem alterar-se a qualquer momento. As estimativas futuras não são tarifas confirmadas.

## Iniciar

Sem instalação de dependências. Necessita de um servidor HTTP local para suportar os módulos JavaScript:

```sh
python3 -m http.server 8080
```

Abre `http://localhost:8080` no navegador, a partir desta pasta. Em HTTPS, a PWA pode funcionar offline depois da primeira visita.

No iPhone, abre a versão alojada em **Safari**, usa **Partilhar > Adicionar ao ecrã principal** e confirma. O acesso offline depende de uma primeira visita online e da gestão de armazenamento do iOS.

## Como usar

1. Confirma partida e destino. Opcionalmente, guarda locais favoritos sem introduzir a morada completa.
2. Consulta as aplicações oficiais da Uber e da Bolt. Regista os preços e tempos, com intervalo máximo quando aplicável.
3. A recomendação distingue menor custo máximo de menor espera até à recolha. Só usa ofertas com menos de cinco minutos.
4. Introduz quantas viagens pretendes fazer no mês e calcula a simulação de custo.
5. Regista a viagem como planeada ou, depois de concluída, o preço final pago. Só os registos pagos entram no relatório.
6. Exporta dados para CSV e descarrega backups JSON regularmente.

Os exemplos das capturas de referência não estão incorporados na aplicação. Não inclui moradas privadas em código público.

## Testes

```sh
node --test tests/*.test.mjs
node --check src/app.mjs
```

## Limitações e segurança

- Sem API oficial de preço/viagens, localização GPS, leitura automática de capturas ou cartografia dentro da aplicação.
- O botão de mapa abre direções no Google Maps. Isto não determina o preço da Uber/Bolt.
- Tudo é armazenado localmente neste navegador em `localStorage`. **Não há conta, nuvem ou sincronização entre dispositivos.** Limpar os dados do Safari pode eliminar o histórico, por isso exporta backup.
- A imagem de uma captura só é pré-visualizada para ajudar a copiar os valores. Não fica guardada.
- O projeto é independente e não afiliado à Uber ou Bolt.

Mais informação: [Especificação](docs/PROJECT_SPEC.md), [Arquitetura](docs/ARCHITECTURE.md), [Estado atual](docs/PROJECT_STATE.md), [Decisões](docs/DECISIONS.md), [Tarefas](docs/TODO.md), [Changelog](docs/CHANGELOG.md).
