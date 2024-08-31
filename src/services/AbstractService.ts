import {Response} from "express";

export default class AbstractService {
    static constructBadResponseObj(res: Response, code: number, error_code: string, description: string) {
        // Validation
        return res.status(code).json({ error_code: error_code, error_description: description });
    }
}
