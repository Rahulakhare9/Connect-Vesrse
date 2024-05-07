window.addEventListener("unload", function (event) {
    $.ajax({
        url: "/leaving-user-update/" + username + "",
        type: "put",
        success: function (response) {
            alert(response);
        },
    });
});
$.ajax({
    url: "/leaving-user-update/" + username + "",
    type: "put",
    success: function (response) {
        alert(response);
    },
});