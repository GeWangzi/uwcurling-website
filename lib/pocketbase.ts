import Pocketbase from 'pocketbase';

//global client sdk instance
export const pb = new Pocketbase(process.env.NEXT_PUBLIC_PB_URL);
