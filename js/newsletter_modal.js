var ecblib = ecblib || {};

document.addEventListener('DOMContentLoaded', function() {

    // 現在のURLを取得
    const url = window.location.href;

    // 英語用メッセージ
    const txtEn = [{
        "modal_ttl": "Subscribe to our newsletter",
        "modal_placeHolder": "Email address",
        "modal_submitBtnTxt": "submit",
        "modal_policyLinkTxt": "privacy policy"
    }]
    const msgEn = [{
        "st1": "Thank you. You are now signed up for THE SHOP YOHJI YAMAMOTO’s newsletter.",
        "st2": "Please enter an email address.",
        "st3": "The email address you have entered contains invalid characters.",
        "st4": "The email address you have entered is already associated with an account."
    }];
    // フランス語用メッセージ
    const txtFr = [{
        "modal_ttl": "Abonnez-vous à notre newsletter",
        "modal_placeHolder": "Adresse e-mail",
        "modal_submitBtnTxt": "S'abonner",
        "modal_policyLinkTxt": "politique de confidentialité"
    }]
    const msgFr = [{
        "st1": "Merci, Vous êtes maintenant inscrit(e) à la newsletter de THE SHOP YOHJI YAMAMOTO.",
        "st2": "Veuillez entrer une Adresse e-mail.",
        "st3": "L'Adresse e-mail que vous avez saisie contient des caractères invalides.",
        "st4": "L'Adresse e-mail que vous avez saisie est déjà enregistrée."
    }];
    // メッセージ用変数
    const msg = url.includes("/fr/") ? msgFr : msgEn;
    const txt = url.includes("/fr/") ? txtFr : txtEn;

    const frParh = url.includes("/fr/") ? "/fr" : "";
    const modalHtml = `
    <div class="modal_inner" wovn-ignore='true'>
      <div class="modal_bg"></div>
      <div class="modal_content">
        <div class="modal_close"></div>
        <form id="newsletterform">
          <div class="title"><p class="title">${txt[0].modal_ttl}</p></div>
          <div class="email"><input id="mail" type="email" name="mail" placeholder="${txt[0].modal_placeHolder}"></div>
          <div class="message"></div>
          <div class="link_wrap">
            <div class="submit"><input type="submit" value="${txt[0].modal_submitBtnTxt}" id="newsletterformsubmit"></div>
            <div class="policy"><a href="${ecblib.sys.wwwroot}${frParh}/shop/pages/privacy.aspx" target="_blank" rel=”noopener”>${txt[0].modal_policyLinkTxt}</a></div>
          </div>
          <div class="close" style="display:none">close</div>
        </form>
      </div>
    </div>`;

    const modal = jQuery(modalHtml);
    const form = modal.find('form')[0]; // フォーム要素を取得して変数に格納
    modal.appendTo("body");
    jQuery('input[name="crsirefo_hidden"]').clone().appendTo(".modal_content form");


    jQuery('.js_modal').on("click", function() {
        modal.fadeIn(200);
        jQuery("body").css({
            "overflow-y": "hidden"
        });
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        sendData();
    });

    jQuery(document).on("click", ".modal_close,.modal_bg, .close", function() {
        modal.fadeOut(200, function() {
            form.reset();
            form.querySelector('.message').textContent = "";
        });
        jQuery("body").css({
            "overflow-y": "scroll"
        });
    });

    // API叩く処理
    function sendData(event) {
        const formData = new FormData(form);
        fetch('/shop/customer/magajax.aspx', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                switch (parseInt(data.message_status)) {
                    case 1:
                        // message_statusが1の場合
                        form.getElementsByClassName('email')[0].style.display = 'none';
                        form.getElementsByClassName('submit')[0].style.display = 'none';
                        form.getElementsByClassName('policy')[0].style.display = 'none';
                        form.getElementsByClassName('message')[0].textContent = msg[0].st1;
                        form.getElementsByClassName('close')[0].style.display = 'flex';
                        break;
                    case 2:
                        // message_statusが2の場合
                        form.getElementsByClassName('message')[0].textContent = msg[0].st2;
                        break;
                    case 3:
                        // message_statusが3の場合
                        form.getElementsByClassName('message')[0].textContent = msg[0].st3;
                        break;
                    case 4:
                        // message_statusが4の場合
                        form.getElementsByClassName('message')[0].textContent = msg[0].st4;
                        break;
                    default:
                        // 上記のいずれにも該当しない場合
                        break;
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

});