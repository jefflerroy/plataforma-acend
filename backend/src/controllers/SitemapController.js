module.exports = {
    async sitemap(req, res) {
        txt = ''
        
        res.setHeader('Content-type', 'text/plain');
        res.send(txt)
    }
}