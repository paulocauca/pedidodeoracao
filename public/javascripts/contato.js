/**
 * Created by paulocauca on 10/08/16.
 */


function enviaContato() {

    var nome = document.getElementById('c_nome').value;
    var assunto = document.getElementById('c_assunto').value;
    var email = document.getElementById('c_email').value;
    var descricao = document.getElementById('c_descricao').value;

    if (nome == null || nome == "") {
        alert("Nome em branco, favor verificar !");
        document.getElementById("c_nome").focus();
        return false;
    } else if (assunto == null || assunto == "") {
        alert("Assunto em branco, favor verificar !");
        document.getElementById("c_assunto").focus();
        return false;
    } else if (email == "" || email == null | isEmail(email) == false) {
        alert("Favor conferir seu e-mail");
        document.getElementById("c_email").focus();
        return false;
    } else if (descricao == null || descricao == "") {
        alert("Descrição em branco, favor verificar !");
        document.getElementById("c_descricao").focus();
        return false;
    } else {
        document.getElementById('formContato').submit();

        // document.getElementById('resultContato').className = "alert alert-success alert-dismissible";
        // document.getElementById('resultContato').innerHTML = "E-mail enviado com sucesso, muito obrigado!"

        alert("E-mail enviado com sucesso, muito obrigado!");

        document.getElementById('c_nome').value = "";
        document.getElementById('c_email').value = "";
        document.getElementById('c_descricao').value = "";

        return false

    }


}

