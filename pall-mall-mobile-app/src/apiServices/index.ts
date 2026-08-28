import {BASE_URL, AI_BASE_URL} from '@env';
import navigationService from '@navigation/navigationService';
import {getToken} from '@redux/selectors';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {SCREENS} from '../constant';
import {persistor, store} from '@redux/store';
import {logout} from '@redux/slice/authSlice';

interface RequestProps<T = any> {
  url: string;
  isAI?: boolean;
  method: AxiosRequestConfig['method'];
  data?: Record<string, any> | FormData | null;
  headers?: Record<string, string> | null;
  params?: Record<string, any> | null;
  isUpload?: boolean;
}

const request = <T = any>({
  url,
  method,
  data = null,
  headers = null,
  params = null,
  isAI = false,
  isUpload,
}: RequestProps<T>): Promise<T> => {
  const token = getToken();
  const finalUrl = isAI ? `${AI_BASE_URL}${url}` : `${BASE_URL}${url}`;

  const isFormData = data instanceof FormData;

  const config: AxiosRequestConfig = {
    url: finalUrl,
    method,
    params: params ?? undefined,
    data: data ?? undefined,
    headers: {
      Accept: '*/*',
      Authorization: token ? `Bearer ${token}` : '',
      ...(isFormData
        ? isUpload
          ? {'Content-Type': 'multipart/form-data'}
          : {}
        : {'Content-Type': 'application/json'}),
      ...headers,
    },
    timeout: 100000,
  };

  console.log('🚀 ~ request ~ config:', config);

  return axios(config)
    .then((response: AxiosResponse<T>) => {
      if (response.status === 401) {
        navigationService.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.AUTH_STACK,
              state: {
                routes: [{name: SCREENS.LOGIN}],
                index: 0,
              },
            },
          ],
        });
        return Promise.reject(response);
      }
      return response.data;
    })
    .catch((err: unknown) => {
      if (axios.isAxiosError(err)) {
        console.log('🚨 Axios Error', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });

        if (err.response?.status === 401) {
          console.log('🔒 Token expired or unauthorized. Logging out...');
          persistor.purge().then(() => {
            store.dispatch(logout());
            navigationService.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.AUTH_STACK,
                  state: {
                    routes: [{name: SCREENS.LOGIN}],
                    index: 0,
                  },
                },
              ],
            });
          });
        }
      } else {
        console.log('🚨 Non-Axios Error', err);
      }
      return Promise.reject(err);
    });
};

export default request;
