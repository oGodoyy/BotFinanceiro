const fs = require('fs');
const path = require('path');
const readline = require('readline');

const arquivoDados = path.join(__dirname, 'dados-financeiros.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let financeiro = {
  salario: 0,
  emprestimos: [],
  faturas: [],
  investimentos: [],
  lazer: []
};

function carregarDados() {
  if (!fs.existsSync(arquivoDados)) {
    return;
  }

  try {
    const dados = fs.readFileSync(arquivoDados, 'utf8');
    const dadosSalvos = JSON.parse(dados);

    financeiro = {
      salario: Number(dadosSalvos.salario) || 0,
      emprestimos: Array.isArray(dadosSalvos.emprestimos) ? dadosSalvos.emprestimos : [],
      faturas: Array.isArray(dadosSalvos.faturas) ? dadosSalvos.faturas : [],
      investimentos: Array.isArray(dadosSalvos.investimentos) ? dadosSalvos.investimentos : [],
      lazer: Array.isArray(dadosSalvos.lazer) ? dadosSalvos.lazer : []
    };

    console.log('\n Dados carregados com sucesso!\n');
  } catch (erro) {
    console.log('\n Não foi possível carregar os dados salvos. Um novo cadastro será iniciado.\n');
  }
}

function salvarDados() {
  fs.writeFileSync(arquivoDados, JSON.stringify(financeiro, null, 2));
}

function perguntar(pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      resolve(resposta.trim());
    });
  });
}

function converterValor(valor) {
  return Number(valor.replace(',', '.'));
}

async function perguntarValor(pergunta) {
  while (true) {
    const resposta = await perguntar(pergunta);
    const valor = converterValor(resposta);

    if (!Number.isNaN(valor) && valor >= 0) {
      return valor;
    }

    console.log('\n Valor inválido. Digite um número válido.\n');
  }
}

async function cadastrarSalario() {
  const salario = await perguntarValor('Digite o valor do salário mensal: R$ ');

  financeiro.salario = salario;
  salvarDados();

  console.log('\n Salário cadastrado com sucesso!\n');
}

async function adicionarEmprestimo() {
  const nome = await perguntar('Nome do empréstimo: ');
  const valor = await perguntarValor('Valor do empréstimo: R$ ');

  financeiro.emprestimos.push({ nome, valor });
  salvarDados();

  console.log('\n Empréstimo adicionado!\n');
}

async function adicionarFatura() {
  const nome = await perguntar('Nome da fatura: ');
  const valor = await perguntarValor('Valor da fatura: R$ ');

  financeiro.faturas.push({ nome, valor });
  salvarDados();

  console.log('\n Fatura adicionada!\n');
}

async function adicionarInvestimento() {
  const nome = await perguntar('Nome do investimento: ');
  const valor = await perguntarValor('Valor investido: R$ ');

  financeiro.investimentos.push({ nome, valor });
  salvarDados();

  console.log('\n Investimento registrado!\n');
}

async function adicionarLazer() {
  const nome = await perguntar('Descrição do lazer: ');
  const valor = await perguntarValor('Valor gasto: R$ ');

  financeiro.lazer.push({ nome, valor });
  salvarDados();

  console.log('\n Gasto de lazer registrado!\n');
}

function calcularTotal(lista) {
  return lista.reduce((total, item) => total + Number(item.valor), 0);
}

function mostrarCategoria(nome, lista) {
  const total = calcularTotal(lista);

  console.log(`\n ${nome}: R$ ${total.toFixed(2)}`);

  if (lista.length === 0) {
    console.log(' Nenhum item cadastrado.');
    return total;
  }

  lista.forEach((item, index) => {
    console.log(`${index + 1}. ${item.nome} - R$ ${Number(item.valor).toFixed(2)}`);
  });

  return total;
}

function gerarRelatorio() {
  const totalEmprestimos = calcularTotal(financeiro.emprestimos);
  const totalFaturas = calcularTotal(financeiro.faturas);
  const totalInvestimentos = calcularTotal(financeiro.investimentos);
  const totalLazer = calcularTotal(financeiro.lazer);

  const gastosTotais = totalEmprestimos + totalFaturas + totalInvestimentos + totalLazer;
  const saldoFinal = financeiro.salario - gastosTotais;

  console.log('\n===================================');
  console.log(' RELATÓRIO FINANCEIRO');
  console.log('===================================');
  console.log(`\n Salário: R$ ${financeiro.salario.toFixed(2)}`);

  mostrarCategoria('Empréstimos', financeiro.emprestimos);
  mostrarCategoria('Faturas', financeiro.faturas);
  mostrarCategoria('Investimentos', financeiro.investimentos);
  mostrarCategoria('Lazer', financeiro.lazer);

  console.log('\n===================================');
  console.log(` Gastos Totais: R$ ${gastosTotais.toFixed(2)}`);
  console.log(` Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
  console.log('===================================\n');

  if (saldoFinal < 0) {
    console.log(' Atenção: seus gastos ultrapassaram seu salário!\n');
  } else {
    console.log(' Parabéns! Você está controlando bem suas finanças.\n');
  }
}

async function limparDados() {
  const confirmacao = await perguntar('Tem certeza que deseja apagar todos os dados? (s/n): ');

  if (confirmacao.toLowerCase() !== 's') {
    console.log('\n Operação cancelada.\n');
    return;
  }

  financeiro = {
    salario: 0,
    emprestimos: [],
    faturas: [],
    investimentos: [],
    lazer: []
  };

  salvarDados();
  console.log('\n Dados apagados com sucesso!\n');
}

async function menu() {
  carregarDados();

  while (true) {
    console.log('===================================');
    console.log('BOT FINANCEIRO');
    console.log('===================================');
    console.log('1 - Cadastrar ou alterar salário');
    console.log('2 - Adicionar empréstimo');
    console.log('3 - Adicionar fatura');
    console.log('4 - Adicionar investimento');
    console.log('5 - Adicionar gasto de lazer');
    console.log('6 - Ver relatório financeiro');
    console.log('7 - Apagar todos os dados');
    console.log('8 - Sair');
    console.log('===================================');

    const opcao = await perguntar('Escolha uma opção: ');

    switch (opcao) {
      case '1':
        await cadastrarSalario();
        break;
      case '2':
        await adicionarEmprestimo();
        break;
      case '3':
        await adicionarFatura();
        break;
      case '4':
        await adicionarInvestimento();
        break;
      case '5':
        await adicionarLazer();
        break;
      case '6':
        gerarRelatorio();
        break;
      case '7':
        await limparDados();
        break;
      case '8':
        console.log('\n Encerrando o Bot Financeiro...');
        rl.close();
        return;
      default:
        console.log('\n Opção inválida!\n');
    }
  }
}

menu();
