// import fs as default
import {default as fsWithCallbacks} from 'fs'
import {join} from 'path'
import {parseJsonToObject} from './util'

// get the promise api for fs
const fs = fsWithCallbacks.promises
const dataDir = join(__dirname, '/../../.data')

// make sure the directory exists
const checkDir = async (dir) => {
    const dirName = `${dataDir}/${dir}`
    const exists = fsWithCallbacks.existsSync(dirName)
    if (!exists) {
        await fs.mkdir(dirName)
    }
    return true
}

// get the complete filename
const getFileName = (dir, fileName) => {
    return `${dataDir}/${dir}/${fileName.replace(/[^a-z0-9]/, '')}.json`
}

// create an object in storage
export const create = async (dir, fileName, data) => {
    await checkDir(dir)
    const fp = await fs.open(getFileName(dir, fileName), 'wx')
    const body = JSON.stringify(data)
    await fs.writeFile(fp, body)
    await fp.close()
    return true
}

// read an object from storage
export const read = async (dir, fileName, converter = (data) => data) => {
    return await fs.readFile(getFileName(dir, fileName), 'utf-8')
        .then(data => converter(parseJsonToObject(data)))
}

// update an object in storage
export const update = async (dir, fileName, data) => {
    await fs.truncate(getFileName(dir, fileName))
    const fp = await fs.open(getFileName(dir, fileName), 'r+')
    const body = JSON.stringify(data)
    await fs.writeFile(fp, body)
    await fp.close()
    return true
}

// remove an object from storage
export const remove = async (dir, fileName) => {
    await fs.unlink(getFileName(dir, fileName))
    return true
}

// check if an object exists in storage
export const exists = (dir, fileName) => fsWithCallbacks.existsSync(getFileName(dir, fileName))

// list all objects in storage in a certain directory
export const list = async (dir) => {
    try {
        const files = await fs.readdir(`${dataDir}/${dir}`)
        return files.map((fileName) => {
            return fileName.replace('.json', '')
        })
    } catch (e) {
        return [];
    }
}

export default {
    create,
    read,
    update,
    remove,
    exists,
    list,
}
