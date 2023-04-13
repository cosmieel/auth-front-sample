export default class Services {
    constructor( { serviceMap, DAOs, userCredentials } ) {
        this.serviceMap = serviceMap; 
        this.DAOs = DAOs;
        this.userCredentials = userCredentials;
    }

    getService( serviceName ) {
        if ( !( serviceName in this.serviceMap ) ) {
            throw new Error(`Service ${serviceName} is not defined`);
        }
        
        const ServiceConstructor = this.serviceMap[serviceName].serviceConstructor;

        if ( typeof ServiceConstructor !== 'function' ) {
            throw new Error(`Command ${serviceName} is not instanceable`);
        }

        const serviceConstructorOptions = {
            userCredentials : this.userCredentials,
        };

        const serviceDAOs = this.serviceMap[ serviceName ].DAOs;

        serviceDAOs.forEach( ( DAOname ) => {
            serviceConstructorOptions[ DAOname ] = this.DAOs[ DAOname ];
        } );

        return new ServiceConstructor( serviceConstructorOptions );
    }
}
