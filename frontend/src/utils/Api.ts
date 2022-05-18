import { ApisauceInstance, create, ApiResponse } from "apisauce";
import { GeneralApiProblem, getGeneralApiProblem } from "./ApiProblem";
declare var baseUrl: string;

class Api {
    private static apiSauce: ApisauceInstance = create({
        baseURL: typeof baseUrl !== "undefined" ? baseUrl : "/",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    private static async handleResponse<T>(
        action: () => Promise<ApiResponse<T, T>>
    ): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        try {
            const response = await action();
            if (!response.ok) {
                const problem = getGeneralApiProblem(response);
                if (problem) return problem;
            }

            return { kind: "ok", data: response.data };
        } catch (error) {
            return { kind: "unknown", temporary: true };
        }
    }

    static async post<T>(url: string, data: any): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => this.apiSauce.post<T>(url, data));
    }

    static async upload<T>(url: string, data: any): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => {
            const formData = new FormData();
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    formData.append(key, data[key]);
                }
            }

            return this.apiSauce.post<T>(url, formData);
        });
    }

    static async download(
        url: string,
        data: any
    ): Promise<
        | { kind: "ok"; data: Blob | undefined; fileName: string | undefined; fileType: string | undefined }
        | GeneralApiProblem
    > {
        try {
            const response = await this.apiSauce.post<Blob>(url, data, { responseType: "blob" });
            if (!response.ok) {
                const problem = getGeneralApiProblem(response);
                if (problem) return problem;
            }

            //Extract file name from headers
            const contentDisposition = response.headers && response.headers["content-disposition"];
            const fileName = contentDisposition?.split("filename=")[1].replace(/"/g, "");

            //Extract content type from headers
            const contentType = response.headers && response.headers["content-type"];

            return {
                kind: "ok",
                data: response.data,
                fileName: fileName,
                fileType: contentType,
            };
        } catch (error) {
            return { kind: "unknown", temporary: true };
        }
    }

    static get<T>(url: string): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => this.apiSauce.get<T>(url));
    }

    static put<T>(url: string, data: any): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => this.apiSauce.put<T>(url, data));
    }

    static delete<T>(url: string): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => this.apiSauce.delete<T>(url));
    }

    static patch<T>(url: string, data: any): Promise<{ kind: "ok"; data: T | undefined } | GeneralApiProblem> {
        return this.handleResponse(() => this.apiSauce.patch<T>(url, data));
    }
}

export default Api;
