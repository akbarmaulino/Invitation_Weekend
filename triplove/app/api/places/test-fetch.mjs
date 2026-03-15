const res = await fetch('https://places.foursquare.com/v3/places/search?query=coffee&ll=-6.2,106.8&limit=1', {
  headers: {
    'Authorization': '0UDXED0SKVX0VA45D4IYW24OH1EJB5ZQUVZ52CIYZINLNORC',
    'Accept': 'application/json',
  }
})
console.log('Status:', res.status)
console.log('Headers:', Object.fromEntries(res.headers))
const text = await res.text()
console.log('Response:', text.slice(0, 500))