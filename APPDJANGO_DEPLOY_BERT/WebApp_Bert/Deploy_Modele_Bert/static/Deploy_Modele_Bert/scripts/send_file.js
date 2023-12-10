
$(document).ready(function() {
        
        
    $('#loading-spinner').hide();
    $('#tnc').hide();

    // Gérer le clic sur le bouton "Transformer"
    $(".submit").click (function () {
    
        var fileInput = document.getElementById('file');
        var file = fileInput.files[0];
    
        $("#myModal").hide();
        $("#openModalBtn").hide();
        $("#h2").hide();
        $('#nb').hide()
        $('#nb1').hide()
        $('#loading-spinner').show();
        $('#tnc').show();
                
        if (file) {
        
           var formData = new FormData();
           formData.append('file', file);
    
           // Récupérez le jeton CSRF à partir des cookies
           var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
    
           $.ajax({
    
              type: 'POST',
              url: predictUrl,
              data: formData,
              processData: false,
              contentType: false,
              mimeType: "multipart/form-data",
              headers: { "X-CSRFToken": csrftoken },
              success: function (response) {
    
                $('#loading-spinner').hide();
                $('#tnc').hide();
                console.log('File uploaded successfully!', response);
    
                $.ajax({
                    type: 'GET',
                    url: downloadPageUrl,  // Remplacez par l'URL appropriée
                    success: function (html) {
                        // Ajoutez le contenu HTML au corps de la page
                        $('body').append(html);
                    },
                    error: function (error) {
                        console.error('Error fetching HTML:', error);
                    }
                });

                    
            },

            error: function (error) {
                console.error('Error uploading file:', error);
            }
        });

    } else {
    
        console.warn('Please select a file.');
    }   
    
    })
    
    });
