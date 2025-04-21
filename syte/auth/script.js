document.addEventListener('DOMContentLoaded', () =>{
    console.log('Страница заугрженна')
    const phoneInput  = document.querySelector('input[name="phone"]')
    const passwordInput = document.querySelector('input[name="password"]')
    const errorMessage = document.querySelector('.error-message')
    const form = document.querySelector('#login-form')
    form.addEventListener('submit', async(event) =>{
        const phone = phoneInput.value
        const cleanPhone = phone.replace(/[^+\d]/g, '');
        const password = passwordInput.value
        event.preventDefault()
        const formData = {
            phone: cleanPhone,
            password: password
        }
        try{
           const response = await fetch('/auth/login', {
                method: "POST",
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify(formData)
            })
            if(response.status === 400){
                const result = await response.json()
                errorMessage.style.display = 'block'
                console.log('Ошибка 400:', result.message)
                return
            }
            const result = await response.json()
            if(result.success){
                errorMessage.style.display = 'none'
                window.location.href ='#'
            }else{console.log('Ошибка со стороный сервера')}
        }catch(err){console.log("Ошибка", err)}
    })
})