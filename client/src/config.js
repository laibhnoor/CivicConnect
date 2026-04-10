const normalizeUrl = (value) => value?.trim().replace(/\/+$/, "");

const envApiBase = normalizeUrl(
	import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
);

const withApiPath = (baseUrl) => {
	if (!baseUrl) return "";
	return /\/api$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api`;
};

export const API_BASE_URL = withApiPath(envApiBase) || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
