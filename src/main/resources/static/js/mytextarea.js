/*
 * den 12.08.2023
 */

/*
 *  Autorow von textarea
 *  wird benutzt in nachricht.html Zeile: 47
 *  textarea ID: nachrichtText
 */
 //var textarea = document.querySelector("textarea");
 nachrichtText.addEventListener("keyup", e => {

    nachrichtText.style.height = "36px";
    var textareaHeight = e.target.scrollHeight;
    nachrichtText.style.height = textareaHeight + "px";
    //console.log(textareaHeight);
 });