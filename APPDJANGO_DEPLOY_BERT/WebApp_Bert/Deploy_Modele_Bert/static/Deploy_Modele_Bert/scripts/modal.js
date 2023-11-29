// Obtenez une référence vers le bouton d'ouverture et le modal
var openModalBtn = document.getElementById("openModalBtn");
var modal = document.getElementById("myModal");
var closeModalBtn = document.getElementById("closeModalBtn");

// Associez une fonction pour ouvrir le modal lorsqu'on clique sur le bouton
openModalBtn.onclick = function () {
    modal.style.display = "block";
};

// Associez une fonction pour fermer le modal lorsqu'on clique sur le bouton de fermeture
closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

// Fermez le modal si l'utilisateur clique en dehors du modal
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
