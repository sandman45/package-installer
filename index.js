const _ = require('lodash');

module.exports = {
    installPackage: (packages) => {
        if (_.isArray(packages)) {
            const orderOfInstall = [];
            const cycleError = {
                lib: {},
            };

            for (let i = 0; i < packages.length; i++) {
                const pack = packages[i].split(':');
                const dep = pack[1].replace(/\s/g, '');
                const lib = pack[0].replace(/\s/g, '');

                if (pack[1].length > 1) {
                    // check if its already in order of install
                    if (orderOfInstall.indexOf(dep) === -1) {
                        orderOfInstall.push(dep);
                        // console.log(`dep: ${dep}`);
                        cycleError.lib[lib] = dep;
                    } else {
                        // console.log(`dep: ${dep}, already in install list`);
                        cycleError.lib[lib] = dep;
                    }
                }
                if (pack[0].length > 1) {
                    if (orderOfInstall.indexOf(lib) === -1) {
                        // console.log(`lib: ${lib}`);
                        orderOfInstall.push(lib);
                        cycleError.lib[lib] = dep;
                    } else {
                        // console.log(`lib: ${lib}, already in install list`);
                        cycleError.lib[lib] = dep;
                    }
                }
            }

            // check cycle
            module.exports.checkLibraries(cycleError.lib, orderOfInstall);
            const results = module.exports.arrangePackages(orderOfInstall);
            console.log(`results: ${results}`);
            return results;
        }
        throw Error('Parameters should be an array');
    },
    checkLibraries: (obj, libraries) => {
        const possibleCycleError = [];
        _.each(libraries, (lib) => {
            // console.log(obj[lib]);
            if (obj[lib].length > 1) {
                const libRes = module.exports.checkDependencies(obj[lib], obj);
                // console.log('-----');
                if (libRes[1]) {
                    possibleCycleError.push(libRes[0]);
                }
            }
        });

        if (possibleCycleError.length > 0) {
            _.each(possibleCycleError, (ce) => {
                const res = module.exports.checkCycle(ce, obj, 0, '');
                // console.log(res);
            });
        }
    },
    checkDependencies: (library, checkObj) => {
        const keys = _.keys(checkObj);
        const rArr = [];
        let dependency = false;
        let mainLibrary = false;
        _.each(keys, (key) => {
            if (key === library) {
                // console.log(`${library}: is a main library`);
                mainLibrary = true;
            }
            if (checkObj[key] === library) {
                // console.log(`${library}: is a dependency of ${key} `);
                dependency = true;
            }
        });

        if (dependency && mainLibrary) {
            // console.log(`possible cycle with ${library}`);
            rArr[0] = library;
            rArr[1] = true;
            return rArr;
        }
        rArr[0] = library;
        rArr[1] = false;
        return rArr;
    },
    checkCycle: (library, obj, count, cycle) => {
        if (count > 5) {
            // console.log(`${library}: Cycle`);
            count = 0;
            // console.log(cycle);
            throw Error(`Cycle Detected => ${cycle}`);
        }
        count++;
        cycle += `${obj[library]}, `;
        // console.log(obj[library]);
        if (obj[library] === undefined) {
            // console.log(`${library}: No Cycle`);
            // console.log(cycle);
            count = 0;
            return cycle;
        }
        return module.exports.checkCycle(obj[library], obj, count, cycle);
    },
    arrangePackages: (lib) => {
        let list = '';
        _.each(lib, (l) => {
            list += `${l}, `;
        });
        const mylist = list.substring(0, list.length - 2);
        return mylist;
    },
};

// module.exports.installPackage(['KittenService: CamelCaser', 'CamelCaser: ']);
//
// module.exports.installPackage(['KittenService: ',
//     'Leetmeme: Cyberportal',
//     'Cyberportal: Ice',
//     'CamelCaser: KittenService',
//     'Fraudstream: ',
//     'Ice: Leetmeme']);
