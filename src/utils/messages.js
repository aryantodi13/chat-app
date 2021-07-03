const generateMessage = (username, text) => {
    return {
        username, 
        text, 
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username, 
        link: url, 
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage, 
    generateLocationMessage
}