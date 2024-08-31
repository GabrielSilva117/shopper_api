import {AppDataSource} from "../data-source";
import {Users} from "../entities/Users";

class UserService {
    createUser (code: string) {
        try {
            return AppDataSource.createQueryBuilder()
                .insert()
                .into(Users)
                .values({
                    code,
                    name: 'user'+code,
                })
                .orIgnore()
                .execute()
        } catch (e) {
            console.error(e);
        }
    };
}

export default new UserService();
