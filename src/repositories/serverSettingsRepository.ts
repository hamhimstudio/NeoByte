import { Service } from "typedi";
import warn from "../models/warn.js";
import baseRepository from "./baseRepository.js";
import serverSettings from "../models/serverSettings.js";

@Service()
export default class serverSettingsRepository extends baseRepository<serverSettings> {
    constructor() {
        super(serverSettings);
    }
}