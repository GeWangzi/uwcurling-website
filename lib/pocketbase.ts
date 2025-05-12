import Pocketbase from 'pocketbase';

//global client sdk instance
export const pb = new Pocketbase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

//unique instance for each server request
export const getPocketbase = () => {
    return new Pocketbase(process.env.PB_URL);
}