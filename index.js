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
                        cycleError.lib[lib] = dep;
                    } else {
                        cycleError.lib[lib] = dep;
                    }
                }
                if (pack[0].length > 1) {
                    if (orderOfInstall.indexOf(lib) === -1) {
                        orderOfInstall.push(lib);
                        cycleError.lib[lib] = dep;
                    } else {
                        cycleError.lib[lib] = dep;
                    }
                }
            }

            // check cycle
            module.exports.checkLibraries(cycleError.lib, orderOfInstall);
            const results = module.exports.arrangePackages(cycleError.lib);
            console.log(`results: ${results}`);
            return results;
        }
        throw Error('Parameters should be an array');
    },
    checkLibraries: (obj, libraries) => {
        const possibleCycleError = [];
        _.each(libraries, (lib) => {
            if (obj[lib].length > 1) {
                const libRes = module.exports.checkDependencies(obj[lib], obj);
                if (libRes[1]) {
                    possibleCycleError.push(libRes[0]);
                }
            }
        });

        if (possibleCycleError.length > 0) {
            _.each(possibleCycleError, (ce) => {
                module.exports.checkCycle(ce, obj, 0, '');
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
                mainLibrary = true;
            }
            if (checkObj[key] === library) {
                dependency = true;
            }
        });

        if (dependency && mainLibrary) {
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
            count = 0;
            throw Error(`Cycle Detected => ${cycle}`);
        }
        count++;
        cycle += `${obj[library]}, `;
        if (obj[library] === undefined) {
            count = 0;
            return cycle;
        }
        return module.exports.checkCycle(obj[library], obj, count, cycle);
    },


    arrangePackages: (obj) => {
        let order = '';
        const checkForDep = (lib) => {
            if (obj[lib].length > 0) {
                // check for more dependencies
                // is this dependency already in install list?
                if (order.search(obj[lib]) !== -1) {
                    // add to list if not already on it
                    if (order.search(lib) === -1) {
                        order += `${lib}, `;
                        return lib;
                    }
                } else {
                    // keep going
                    return checkForDep(obj[lib]);
                }
            }
        };
        // add libraries without dependencies first
        _.each(obj, (dep, key) => {
            if (dep.length === 0) {
                order += `${key}, `;
            }
        });
        // recursive for dependecies
        _.each(obj, (dep, key) => {
            if (dep.length > 0) {
                checkForDep(key);
                if (order.search(key) === -1) {
                    order += `${key}, `;
                }
            }
        });
        const installList = order.substring(0, order.length - 2);
        return installList;
    },
};


// process.argv.forEach((val, i, array) => {
//     const packageArray = array.splice(2, array.length - 1);
//     console.log(`Arguments: ${packageArray}`);
//     module.exports.installPackage(packageArray);
// });

// valid
// module.exports.installPackage(['KittenService: CamelCaser', 'CamelCaser: ']);
//

// module.exports.installPackage([
//     'KittenService: ', 'Leetmeme: Cyberportal', 'Cyberportal: Ice', 'CamelCaser: KittenService', 'Fraudstream: Leetmeme', 'Ice:',
// ]);

// invalid
// module.exports.installPackage(['KittenService: ',
//     'Leetmeme: Cyberportal',
//     'Cyberportal: Ice',
//     'CamelCaser: KittenService',
//     'Fraudstream: ',
//     'Ice: Leetmeme']);
