/**
 * Created by paulocauca on 06/06/16.
 */


// ######## VARIAVEIS GLOBAIS  ########
//var socket = io.connect(document.URL);
var socket = io.connect('http://pedidosdeoracao.net:21069');
//var host = '192.168.100.50:3000';
var maxLength = 516;
var v_qtde_oracao;
var v_po_count = 0;
var v_po_first = true;


// ########  FUNCOES ########
function getCount() {
    var count = document.getElementById('v_oracao').value.length;
    document.getElementById('countTextArea').innerHTML = maxLength - count;
};

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function enviarOracao(){

    var nome    = document.getElementById('v_nome').value;
    var email   = document.getElementById('v_email').value;
    var oracao  = document.getElementById('v_oracao').value;

   //var check    = document.getElementById('v_checkbox').checked;

    if(oracao == null || oracao == "" || isBlackList(oracao) == true){
        alert("Oração em branco ou com palavras ofensivas, favor verificar !");
        document.getElementById("v_oracao").focus();
        return false;
    }else if(nome == "" || nome.length < 5 ){
        alert("Nome em branco ou menor que 5 caracteres.");
        document.getElementById("v_nome").focus();
        return false;
    }else if(email == "" || email ==  null ){
       if(confirm("O e-mail não é obrigatório, mas como iremos te achar ?","Adicinar e-mail", "Continuar"))
       {
           socket.emit('envia oracao', {nome: nome, email : email, oracao : oracao});
           limpaOracao();
           return true;
       }else{
           document.getElementById("v_email").focus();
           return false;
       }
    }else if (isEmail(email) == false ){
        alert("Favor conferir seu e-mail");
        document.getElementById("v_email").focus();
        return false;
    } else {
        socket.emit('envia oracao', {nome: nome, email : email, oracao : oracao});
        limpaOracao();
        return false;
    }
}

function limpaOracao (){
    document.getElementById('v_nome').value = "";
    document.getElementById('v_email').value= "";
    document.getElementById('v_oracao').value= "";
}

function isBlackList(oracao){
     //Intenca de verificar se nap tem palavra ofensiva
    return false
}

function set_cookie(cookiename, cookievalue, hours) {
    var date = new Date();
    date.setTime(date.getTime() + Number(hours) * 3600 * 1000);
    document.cookie = cookiename + "=" + cookievalue + "; path=/;expires = " + date.toGMTString();

}

function get_cookie(id) {
    // Ao encontrar o ID no cookie desabilita o botao de like
    document.cookie.split(";").forEach(function (element) {
            if(element.split("=")[1] == id){
                var btn_vouOrar = document.getElementById('btn_vouOrar'+id);
                btn_vouOrar.disabled = true;
                btn_vouOrar.className = "btn btn-success";
            };
        }
    )
}





function vouOrar(id, qtde){

    set_cookie('id_oracao['+id+']', id, 24 * 1); // data expiracao   24 * 1

    socket.emit('vou orar', { id_oracao : id } );

    var btn_vouOrar = document.getElementById('btn_vouOrar'+id);
        btn_vouOrar.disabled = true;
        btn_vouOrar.className = "btn btn-success";
        btn_vouOrar.innerHTML =  '<span class="glyphicon glyphicon-thumbs-up"></span> ' + Number(qtde + 1) ;

}

function oracoesRespondidas(){
   // document.getElementById('oracoes_respondidas').style.opacity = 100;
    socket.emit('Oracoes Respondidas');

    var oracoes_resp_button = document.getElementById('oracoes_resp_button');
    var oracoes_resp_text = document.getElementById('oracoes_resp_text');
    oracoes_resp_button.disabled = true;
    oracoes_resp_button.className = "list-group-item list-group-item-info";
    oracoes_resp_text.innerHTML = "Amém, ficamos felizes em saber que Deus está te abençoando :-)"
}



function populaHash(hashtag){
   // console.log(hashtag);
    document.getElementById('v_search_hashtag').value = hashtag;
    socket.emit('search hashtag', { hashtag : hashtag } );
}

function searchHashtag(){
  //  console.log(String(socket.id));
    var hashtag = document.getElementById('v_search_hashtag').value;
    socket.emit('search hashtag', { hashtag : hashtag } );

}


function atualizaOracoes() {
    socket.emit('atualizar oracoes');
    document.getElementById('alerta_new_oracoes').hidden = true;

}

// ########  SOCKET IO ########

//TODO : Painel lateral esquerdo Summary
socket.on('usuarios orando',function(quantidade) {
    document.getElementById('usuarios_orando').innerHTML = quantidade;
});

// SOCKET ON
//TODO : Quando o indicador de quantidade de oracao é modificado, aperece o notificador para todos

socket.on('pedidos oracao',function(quantidade) {
    v_qtde_oracao = quantidade[0].QTDE;
    document.getElementById('pedidos_oracao').innerHTML = quantidade[0].QTDE;

    if (v_po_first){
        v_po_count = quantidade[0].QTDE;
        v_po_first = false;
    }

    if(quantidade[0].QTDE > v_po_count ){
        v_po_count = quantidade[0].QTDE;
        document.getElementById('alerta_new_oracoes').hidden = false;

    }

});
// SOCKET ON
socket.on('oracoes realizadas',function(quantidade) {
    document.getElementById('oracoes_realizadas').innerHTML  = quantidade[0].QTDE;
});

socket.on('oracoes respondidas',function(quantidade) {
    document.getElementById('oracoes_respondidas').innerHTML = quantidade[0].QTDE;
});

// TODO : Atualiza Oracoes ( indivudual para cada usuario )
socket.on('atualiza oracoes', function (oracao) {

    if(oracao.length == 0  && document.getElementById('v_search_hashtag').value ){
        document.getElementById('show_oracoes').innerHTML = "Desculpe-nos, hashteg <a> #" + document.getElementById('v_search_hashtag').value + " </a>não encontrada :-(" ;
    }else if(oracao.length == 0  && document.getElementById('v_search_hashtag').value == ""){
        document.getElementById('show_oracoes').innerHTML = "Gostaríamos tanto de Orar, mas não temos pedidos de oração até o momento :-( "
    }else {
        document.getElementById('show_oracoes').innerHTML = "";

        var bg = 0;
        for (i = 0; i < oracao.length; i++) {
            if (bg == 0) {
                var bg_color = "#fff";
                bg = 1
            } else {
                var bg_color = "#eee";
                bg = 0
            }
            document.getElementById('show_oracoes').innerHTML += '<ul class="media-list">' +
            '<li class="list-group-item" style="background-color: ' + bg_color + ' " >' +
            '<h4>' + oracao[i].NOME + '</h4>' +
            '<p class="lead text-justify">' + oracao[i].ORACAO.replace(/#(\S*)/g, '<a onclick=populaHash("$1") href="#">#$1</a>') + '</p> ' +
            '<button type="button" id="btn_vouOrar' + oracao[i].ID_ORACAO + '" class="btn btn-warning" onclick="vouOrar( ' + oracao[i].ID_ORACAO + ', ' + oracao[i].QTDE + ')">' +
            '<span class="glyphicon glyphicon-thumbs-up"></span>  ' + oracao[i].QTDE +
            '</button>' +
            '<text class="text-danger text-left">   Me comprometo, em nome de Jesus, a orar por este pedido !</text> ' +
            '</li></ul>';
            get_cookie(oracao[i].ID_ORACAO);  // Coleta Cookies
        }
    }
});



