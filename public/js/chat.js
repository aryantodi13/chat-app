const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-form input[name="message"]')
const $messageFormButton = document.querySelector('#message-form button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('userConnected', (message) => {
    console.log(message);
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled');
    
    socket.emit('sendMessage',$messageFormInput.value, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.focus()
        if(error) return console.log(error)
        console.log('Message was delivered')
    })

    $messageFormInput .value = ''
})

socket.on('message', (message) => {
    console.log('New message :', message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Your browser does not support geolocation')
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared to the console.')
        })
    })

})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(urlTemplate, {
        username: url.username,
        url: url.link, 
        createdAt: moment(url.createdAt).format('h:m A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})