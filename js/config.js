/**
 * StadiumOS AI - Global Configuration Redirector
 * Maintains backward compatibility with legacy config imports.
 */
import { CONFIG as newConfig } from './config/index.js';

export const CONFIG = newConfig;
export default CONFIG;
