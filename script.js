class Item {
    constructor(id, nome, preco, categoria, data, cep, endereco) {
      this.id = id;
      this.nome = nome;
      this.preco = preco;
      this.categoria = categoria;
      this.data = data;
      this.cep = cep;
      this.endereco = endereco;
    }
  }
  
  class Catalogo {
    constructor() {
      this.lista = JSON.parse(localStorage.getItem("itens")) || [];
      this.editando = null;
      this.form = document.getElementById("item-form");
      this.listaDOM = document.getElementById("lista");
      this.inputs = {
        nome: document.getElementById("nome"),
        preco: document.getElementById("preco"),
        categoria: document.getElementById("categoria"),
        data: document.getElementById("data"),
        cep: document.getElementById("cep")
      };
      this.form.addEventListener("submit", e => this.salvar(e));
      this.render();
    }
  
    validar() {
      let valido = true;
      for (let key in this.inputs) {
        const input = this.inputs[key];
        if (input.value.trim() === "") {
          input.classList.remove("valid");
          input.classList.add("invalid");
          valido = false;
        } else {
          input.classList.remove("invalid");
          input.classList.add("valid");
        }
      }
      return valido;
    }
  
    buscarEndereco(cep) {
      return fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => data.logradouro || "Endereço não encontrado");
    }
  
    async salvar(e) {
      e.preventDefault();
      if (!this.validar()) return;
  
      const { nome, preco, categoria, data, cep } = this.inputs;
      const endereco = await this.buscarEndereco(cep.value);
  
      const item = new Item(
        this.editando ?? Date.now(),
        nome.value,
        preco.value,
        categoria.value,
        data.value,
        cep.value,
        endereco
      );
  
      if (this.editando) {
        const index = this.lista.findIndex(i => i.id === this.editando);
        this.lista[index] = item;
        this.editando = null;
      } else {
        this.lista.push(item);
      }
  
      this.salvarStorage();
      this.limparFormulario();
      this.render();
    }
  
    salvarStorage() {
      localStorage.setItem("itens", JSON.stringify(this.lista));
    }
  
    limparFormulario() {
      this.form.reset();
      for (let key in this.inputs) {
        this.inputs[key].classList.remove("valid", "invalid");
      }
    }
  
    editar(id) {
      const item = this.lista.find(i => i.id === id);
      for (let key in this.inputs) {
        this.inputs[key].value = item[key];
      }
      this.editando = id;
    }
  
    remover(id) {
      this.lista = this.lista.filter(i => i.id !== id);
      this.salvarStorage();
      this.render();
    }
  
    render() {
      this.listaDOM.innerHTML = "";
      this.lista.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div>
            <p><strong>${item.nome}</strong> - R$${item.preco}</p>
            <p>${item.categoria} | ${item.endereco}</p>
          </div>
          <div>
            <button onclick="app.editar(${item.id})">Editar</button>
            <button onclick="app.remover(${item.id})">Remover</button>
          </div>
        `;
        this.listaDOM.appendChild(card);
      });
    }
  }
  
  const app = new Catalogo();
  