import { customAlphabet } from 'nanoid/async'

const NANO_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const NANO_SIZE = 12;

const nanoid = customAlphabet(NANO_ALPHABET, NANO_SIZE);

export default nanoid;