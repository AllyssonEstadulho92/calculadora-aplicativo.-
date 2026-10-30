# Decisões técnicas

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-10-30 | Web app/PWA com HTML/CSS/JS nativos | Menor complexidade, sem dependências, adequada a iPhone e desktop. |
| 2026-10-30 | Não prometer preços ao vivo | Uber exige aprovação e proíbe usar a sua API de estimativas para comparação com concorrentes; a Bolt fornece estimativas dinâmicas. |
| 2026-10-30 | Ofertas com cinco minutos de frescura | Reduzir recomendações baseadas em informações antigas, sem afirmar estabilidade dentro desse período. |
| 2026-10-30 | Ordenar preço pelo limite superior | Em intervalos, valor máximo é mais prudente. Resultado marcado como inconclusivo quando os preços se cruzam. |
| 2026-10-30 | Cálculos em cêntimos inteiros | Evitar erros de arredondamento de JavaScript com euros decimais. |
| 2026-10-30 | Só viagem paga conta em despesas | Separar previsão financeira de saída real de dinheiro. |
| 2026-10-30 | Armazenamento local + backup manual | Evitar infraestrutura e recolha de dados pessoais nesta versão. Exige aviso explícito de risco de perda. |
| 2026-10-30 | Captura apenas para consulta visual | OCR automático sem validação poderia inventar/interpretar mal preços e descontos. |
