document.addEventListener('DOMContentLoaded', () =>{
    console.log('Страница загруженна')
    const form = document.querySelector('#register-form') 
    // console.log(form)
    const phoneInput = document.querySelector('input[name="phone"]')
    const passwordInput = document.querySelector('input[name="password"]')
    const confirmPasswordInput = document.querySelector('input[name="confirm_password"]')
    const errorMessage = document.querySelector('.error-message')
    const userMessage = document.querySelector('.user-message')
    console.log(userMessage)
    form.addEventListener("submit", async(event) =>{
        const phone = phoneInput.value
        const password = passwordInput.value
        const confirmPassword = confirmPasswordInput.value

        console.log('Нажал на кнопку ')
        event.preventDefault()
        console.log(password, confirmPassword)
        // if(password !== confirmPassword){
        //     console.log('не повторяются пароли')
        //     errorMessage.style.display='block'
        //     return
        // }else{
        //     console.log('совпадют')
        //     errorMessage.style.display='none'
        // }
        const formData = {
            phone: phone,
            password: password,
            confirm_password: confirmPassword
        }

        try{
            const response = await fetch('/reg/register', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            })
            console.log(`Cтатус ответа: ${response.status}`)
            
            if(response.status === 400){
                const result = await response.json()
                console.error('Ошибка 400:', result.message)
                errorMessage.style.display = 'block'
                userMessage.style.display = 'none'
                return
            }
            
            if(response.status === 409){
                const result = await response.json()
                console.log('Ошибка 409:', result.message)
                userMessage.style.display = 'block'
                errorMessage.style.display = 'none'
                return
            }            
            if(!response.ok){
                console.log('Ошибка HTTP:', response.status);
                return
            }
            const result = await response.json()
            if(result.success){
                window.location.href = '/verify-code'
            }
            else{
                console.log('Ошибка со стороны сервера')
            }
        }catch(err){console.log(err)}
    })

})