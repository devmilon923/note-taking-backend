import type { Response } from "express";

type TSuccess = {
  status?: true;
  message: string;
  data: any;
  pagination?: {
    totalPage: number;
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    totalData: number;
  };
};

type TError = {
  status?: false;
  message: string;
  data?: any;
};

export function SendSuccess(res: Response, code: number, payload: TSuccess) {
  res.statusCode = code;
  payload.status = true;
  return res.send(payload);
}
export function SendError(res: Response, code: number, payload: TError) {
  res.statusCode = code;
  payload.status = false;
  return res.send(payload);
}
