function TradeTaxViewModel(){
    var self = this;
    //teste ko funcionando- bindings dos labels
    var ViewModel = function() {
        this.myValues = ko.observableArray([2, 6]);
     };

    outraCorretora = ko.observable(false);
    
    //bindings do select do form
    self.selectedAsset = ko.observable();
    self.qtdContratos = ko.observable();
    self.pontosRealizados = ko.observable();
    self.selectedBroker = ko.observable();
    self.taxaOutraCorretora = ko.observable();

    //bindings do resultado
    self.corretagem = ko.observable();
    self.b3 = ko.observable();
    //options tipo operacao
    self.ativo = ko.observableArray([
        {ativo: "IND (cheio)", value: 1},
        {ativo: "WIN (Mini Índice)", value: 0.20},
        {ativo: "DOL (cheio)", value: 50},
        {ativo: "WDO (Mini Dólar)", value: 10},
    ]);
    //lista de corretoras e taxas
    self.taxaCorretora = ko.observableArray([
        {corretora: "ModalMais", taxa: 0},
        {corretora: "Clear", taxa: 0},
        {corretora: "NovaFutura", taxa: 0.25},
        {corretora: "Rico", taxa: 0},
    ]);
    //lista de trades
    self.resultadoTotalTaxas = ko.observableArray([]);
    self.resultadoNegociacao = ko.observableArray([]);
    self.tradeHistory = ko.observableArray([]);
    self.taxHistory = ko.observableArray([]);
    
    //pega os meus campos e verifica a validade deles
    self.hasBeenSubmitted = ko.observable(false);

    self.handlerSubmit = function(){
       var payload = {
           ativo: self.selectedAsset().value,
           contratos: self.qtdContratos(),
           pontosRealizados: self.pontosRealizados(),
           corretora: self.selectedBroker().taxa,
           taxaOutraCorretora: self.taxaOutraCorretora()
       }      
       self.hasBeenSubmitted(true)
       self.calculaTaxasOperacionais(payload);
       
    }
    
    //objeto com a negociacao
    self.calculaTaxasOperacionais = function(payload){
        //a taxa muda para o mini dolar/indice/dolarcheio
        
        
       
        var taxaBolsa = 0.32 * Number(payload.contratos);
        var taxaCorretagemPorContrato = Number(payload.corretora) * (payload.contratos * 2);
  
        var valorNegociado = (payload.pontosRealizados * payload.ativo) * payload.contratos;

        var impostoRendaDeduzido = valorNegociado * 0.01;
        var totalImpostoRenda = valorNegociado  * 0.2;  
        
        var totalDescontoSemIr= taxaBolsa + impostoRendaDeduzido + taxaCorretagemPorContrato;
        var totalDescontoComIr = taxaBolsa + totalImpostoRenda + taxaCorretagemPorContrato;

        var resultadoLiquido = valorNegociado - totalDescontoSemIr;

        self.resultadoTotalTaxas.removeAll();
        self.resultadoTotalTaxas.push(new AddResultado("Taxas de Operação: corretagem",taxaCorretagemPorContrato),
                                      new AddResultado("BMEF: registro + emolumentos",taxaBolsa),
                                      new AddResultado("IR: deduzido (1%)",impostoRendaDeduzido),
                                      new AddResultado("IR: total (20%)",totalImpostoRenda))
        
        self.resultadoNegociacao.removeAll();
        self.resultadoNegociacao.push(  new AddResultado("Valor negociado",valorNegociado),
                                        new AddResultado("total imposto e taxas",totalDescontoComIr),
                                        new AddResultado("Resultado Líquido da operação",resultadoLiquido))
                                   
        
      
        console.log(self.resultadoNegociacao())
    };
   
    //lógica que escreve o cálculo
    
    self.addHistorico = function(){
        var resultado = "LOSS"
        if(self.resultadoNegociacao()[2].valor > 0){
            resultado = "GAIN"
            
        }else{
           
        }
        self.tradeHistory.push( new AddTrade( self.selectedAsset().ativo,
                                            resultado,
                                            self.resultadoNegociacao()[2].valor))
        self.taxHistory.push(new AddTrade(self.selectedAsset().ativo, resultado, self.resultadoNegociacao()[1].valor))
        self.hasBeenSubmitted(false);
        
    }
    //remove a operação da lista
    self.removeTrade = function(trade){
        //

        self.taxHistory.pop();
        self.tradeHistory.remove(trade);
        
    }

    //retorna o total dos resultados calculados
    self.totalAcumulado = ko.computed(function(){
        var total = 0;
        for(var i = 0; i < self.tradeHistory().length; i++){
            //console.log(self.tradeHistory()[i].value)
            total += self.tradeHistory()[i].value;
        }
        return total;
    });

    //retorna o total de taxas calculado
    self.taxasTotalAcumulado = ko.computed(function(){
        var total = 0;
        for(var i = 0; i < self.taxHistory().length; i++){
            //console.log(self.tradeHistory()[i].value)
            total += self.taxHistory()[i].value;
        }
        return total;
    });
    
};

//auxiliar
function AddTrade(asset,result, value) {
    var self = this;

    self.asset = asset;
    self.result = result;
    self.value = value;

    self.formattedPrice = ko.computed(function(){
        var price = self.value;

    return price ? "R$" + price.toFixed(2) : "0";
    })
    
}

function AddResultado(nome, valor) {
    var self = this;

    self.nome = nome;
    self.valor = valor;

    self.formattedPrice = ko.computed(function(){
        var price = self.valor;

        return price ? "R$" + price.toFixed(2) : "0";
    })
    
}

const knockoutApp = document.querySelector("#knockout-app")
ko.applyBindings(new TradeTaxViewModel(), knockoutApp)

