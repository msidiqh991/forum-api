const NewThread = require('../NewThread');

describe('NewThread entities', () => {
    it('should throw error when payload not contain needed property', () => {
        const payload = {
            title: 'Thread Title',
        }

        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    })

    it('should throw error when payload not meet data type specification', () => {
        const payload = {
            title: 123,
            body: true,
        }
        
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    })

    it('should create NewThread object correctly', () => {
        const payload = {
            title: 'Thread Title',
            body: 'Thread Body',
        }

        const newThread = new NewThread(payload);

        expect(newThread.title).toEqual(payload.title);
        expect(newThread.body).toEqual(payload.body);
    })
})