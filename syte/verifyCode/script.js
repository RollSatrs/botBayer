
document.addEventListener('DOMContentLoaded', () =>{
    const form = document.querySelector('#code')
    const button = document.querySelector('.btn')
    const inputs = document.querySelectorAll('.input-code input')
    inputs.forEach((input, index) =>{
        input.addEventListener('input', () =>{
            console.log(input.value)
            if(input.value && index < inputs.length -1){
                inputs[index+1].focus()
            }
        })
        input.addEventListener('keydown', (el) =>{
            if(el.key === 'Backspace' && !input.value && index>0){
                inputs[index -1].focus()
            }
        })
    })
    form.addEventListener('submit', async(event) =>{
        console.log('Нажал на кнопку ')
        event.preventDefault()
        const codeInput = Array.from(inputs).map(input =>input.value).join('')
        console.log(codeInput)
    })


})


