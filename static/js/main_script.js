alert_wrapper = document.querySelector(".alert")
        alert_method = document.querySelector(".alert__close")
        if (alert_wrapper){
            alert_method.addEventListener("click", function(){
            alert_wrapper.style.display = "none"
        })

        }

