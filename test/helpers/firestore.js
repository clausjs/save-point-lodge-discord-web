// A serialized transaction fake models Firestore's atomic read/delete/write boundary.
module.exports = () => {
    const data = new Map();
    let pending = Promise.resolve();
    const snapshot = key => ({ data: () => data.get(key) });
    const collection = name => ({
        doc: id => ({ key: `${name}/${id}`, set: async value => data.set(`${name}/${id}`, value), get: async () => snapshot(`${name}/${id}`) }),
        where: (field, op, value) => ({ get: async () => ({ docs: [...data].filter(([key, record]) => key.startsWith(name + '/') && record[field] === value)
            .map(([key, record]) => ({ id: key.split('/')[1], data: () => record })) }) })
    });
    return { data, collection, runTransaction: callback => {
        const run = pending.then(async () => {
            const writes = [];
            const result = await callback({ get: async ref => snapshot(ref.key), delete: ref => writes.push(() => data.delete(ref.key)), set: (ref, value) => writes.push(() => data.set(ref.key, value)) });
            writes.forEach(write => write());
            return result;
        });
        pending = run.catch(() => {});
        return run;
    } };
};
