class AulasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.aulas = [
      { id: 1, disciplina: 'S05 - Interface Homem-máquina', data: 'ter', horario: '10:00', local: 'P1-S17', prova_alert: false, prova: '12/05', frequencia: '10/25', nota: '10' },
      { id: 2, disciplina: 'E01 - Circuitos Elétricos em Corrente Contínua', data: 'ter', horario: '10:00', local: 'P1-S17', prova_alert: true, prova: '12/05', frequencia: '10/25', nota: '5' },
      { id: 3, disciplina: 'M02 - Álgebra e Geometria Analítica', data: 'qua', horario: '10:00', local: 'P1-S17', prova_alert: true, prova: '12/05', frequencia: '10/25', nota: '7' }
    ];

    this.hoje = "ter";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const aulasDia = this.aulas.filter(a => a.data === this.hoje);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles_componente.css">
      <div>
        ${
          aulasDia.length === 0
            ? `<div class="comp-aula"><p>Nenhuma aula hoje</p></div>`
            : aulasDia.map(a => {
                return `
                  <div class="comp-aula">
                    ${
                      a.prova_alert
                        ? `<div class="lable-prova p_lable">PROVA: <b>${a.prova}</b></div>`
                        : ''
                    }
                    <div class="titulo_aula">${a.disciplina}</div>
                    <p class="p">Local e Horário: <b>${a.local} - ${a.horario}</b></p>
                    <div class="lables">
                      <div class="lable-frequencia p_lable">FALTAS: <b>${a.frequencia}</b></div>
                      <div class="lable-nota p_lable">CR: <b>${a.nota}</b></div>
                    </div>
                  </div>
                `;
              }).join('')
        }
      </div>
    `;
  }
}

customElements.define('aulas-component', AulasComponent);
