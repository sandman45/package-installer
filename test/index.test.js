
const { expect } = require('chai');

describe('index', () => {
    describe('#installPackage', () => {
        it('should accept an array as parameters and return CamelCaser, KittenService', () => {
            const pi = require('../index');
            const packages = ['KittenService: CamelCaser', 'CamelCaser: '];
            const results = pi.installPackage(packages);
            expect(results).to.eq('CamelCaser, KittenService');
        });

        it('should accept an array as parameters and return KittenService, Ice, Cyberportal, Leetmeme, CamelCaser, Fraudstream', () => {
            const pi = require('../index');
            const packages = [
                'KittenService: ',
                'Leetmeme: Cyberportal',
                'Cyberportal: Ice',
                'CamelCaser: KittenService',
                'Fraudstream: Leetmeme',
                'Ice: ',
            ];
            const results = pi.installPackage(packages);
            expect(results).to.eq('KittenService, Ice, Cyberportal, Leetmeme, CamelCaser, Fraudstream');
        });

        it('should reject if it is not an array', () => {
            const pi = require('../index');

            const packages = {};
            expect(pi.installPackage.bind(pi, packages)).to.throw(Error);

            const packages2 = 'string';
            expect(pi.installPackage.bind(pi, packages2)).to.throw(Error);

            const packages3 = 45;
            expect(pi.installPackage.bind(pi, packages3)).to.throw(Error);
        });

        it('should reject as invalid if a dependency contains cycles', () => {
            const pi = require('../index');
            const packages = [
                'KittenService: ',
                'Leetmeme: Cyberportal',
                'Cyberportal: Ice',
                'CamelCaser: KittenService',
                'Fraudstream: ',
                'Ice: Leetmeme',
            ];
            expect(pi.installPackage.bind(pi, packages)).to.throw(Error);
        });
    });
});
