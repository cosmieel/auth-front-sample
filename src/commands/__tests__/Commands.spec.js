import Commands from '../Commands';

const mockedServices = {};
const mockedStateMachine = {};
const mockedCommandsMap = {
    validCommand           : jest.fn(),
    nonInstanceableCommand : {},
};

describe( 'Commands', () => {

    const commands = new Commands(
        {
            commandMap   : mockedCommandsMap,
            stateMachine : mockedStateMachine,
            services     : mockedServices,
        }
    );

    describe( 'метод getCommand', () => {
        
        it( 'должен выбрасывать ошибку, если команда не найдена', () => {
            expect( () => commands.getCommand('nonExistingCommand') )
                .toThrow('Command nonExistingCommand is not defined');
        } );

        it( 'должен выбрасывать ошибку, если нельзя создать инстанс команды', () => {
            expect( () => commands.getCommand('nonInstanceableCommand') )
                .toThrow('Command nonInstanceableCommand is not instanceable');
        } );
        
        it( 'должен вызывать конструктор нужной команды с нужными параметрами', () => {
            const command = commands.getCommand('validCommand');

            expect( mockedCommandsMap.validCommand ).toBeCalledWith( {
                stateMachine : mockedStateMachine,
                services     : mockedServices,
            } );
            expect( command ).toBeInstanceOf( mockedCommandsMap.validCommand );
        } );
    } );
} );
