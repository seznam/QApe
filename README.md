# Opicak

## Install
Simply install the latest version via npm install
```
npm install opicak
```

Than you can run opicak like this
```
node_modules/.bin/opicak -u https://www.example.com
```

### Configuration
Opicak will look for configuraition file in your current directory with name `opicak.conf.js`.

```javascript
module.exports = {
	url: 'https://www.seznamzpravy.cz',
	parallelInstances: 10
}
```

## Development
Build
```
npm run build
```
Build with watch
```
npm run dev
```
Run local testing website (from example)
```
node server.js
```
Start local version of opicak with source mapping
```
npm start -- [options]
```
