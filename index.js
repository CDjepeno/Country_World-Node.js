const express = require('express')
const path = require('path');
const exphbs = require('express-handlebars')
const fetch = require('node-fetch')
const helpers = require('handlebars-helpers')(['string'])
const bodyParser = require('body-parser')


const app = express()

const PORT = process.env.PORT || 5000

const catchErrors = asyncFunction => (...args) => asyncFunction(...args).catch(console.error)

const getCountries = catchErrors(async () => {
    const res = await fetch('https://restcountries.eu/rest/v2/all')
    const json = await res.json()
    return json
})

const getCounty = catchErrors(async (country) => {
    const res = await fetch(`https://restcountries.eu/rest/v2/name/${country}`)
    const json = await res.json()
    return json
})

/**
 * Middleware
 */
app
    .use(bodyParser())
    .use(express.static(path.resolve(__dirname, 'public')))
    .engine('.hbs', exphbs({ extname: '.hbs' }))
    .set('view engine', '.hbs')

/**
 * Endpoints
 */
app.get('/', catchErrors(async (_,res) => {
    const countries = await getCountries();
    res.render('home', { countries })
}))

app.post('/search', catchErrors(async (req,res) => {
    const search = req.body.search
    res.redirect(`/${search}`)
}))

app.get('/notfound', (_, res) => res.render('notFound'))

app.get('/:search', catchErrors(async (req,res) => {
    const search = req.params.search
    const country = await getCounty(search)

    if(country.status !== 404) {
        res.render('country', { country })
    } else {
        res.redirect('notFound')
    }
}))


app.listen(PORT, () => console.log(`Serveur is listening on port ${PORT}`))