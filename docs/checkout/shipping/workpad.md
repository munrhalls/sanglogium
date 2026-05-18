# Furgonetka API endpoint for shipping page
- based on furgonetka api lessons (in beads) - correctly structured, all preflight checks work
- takes sender address, recipient address, parcel data as input 
- returns list of carrier / rate
- logs list of carrier / rate to dev tools console on shipping page or to terminal (whatever is simpler) 

# Shipping page - data tracer bullet implementation for just Poland (PL)
- retrieving recipient address from sessionStorage
- retrieving correct sender address from .env file based on recipient address
- making endpoint for Poland, to get list of carrier / rate, that uses Furgonetka API in correct manner
- selecting correct API endpoint based on sender address (furgonetka API for PL, packlink pro API for DE/GB) - for this tracer bullet, should only test Polish recipient address and therefore, select Poland 
- making correct API endpoint request with (sender address, recipient address, parcel data) to receive list of carrier / cost and if available from API - estimated delivery timeline 
- displaying the delivery options in ui in barebones manner  
