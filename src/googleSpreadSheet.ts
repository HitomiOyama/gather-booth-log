import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,GOOGLE_PRIVATE_KEY } from "./config";

/**
 * GoogleSpreadsheet を操作する Service
 *
 * @see APIドキュメント {@link https://theoephraim.github.io/node-google-spreadsheet/#/}
 */
export class GoogleSpreadsheetService {
  private static instance?: GoogleSpreadsheetService;
  private doc: GoogleSpreadsheet;

  private constructor() {
    this.doc = new GoogleSpreadsheet(SHEET_ID);
  }

  /**
   * GoogleSpreadsheetService のインスタンスを取得する
   */
  static async getInstance() {
    if (this.instance) {
      return this.instance;
    }

    const instance = new GoogleSpreadsheetService();

    await instance.doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
      private_key: GOOGLE_PRIVATE_KEY,
    });
    await instance.doc.loadInfo();

    return instance;
  }

  /**
   * スプレットシートのタイトルを取得する
   *
   * @returns スプレットシートのタイトル
   */
  getTitle() {
    return this.doc.title;
  }

  /**
   * スプレットシートのタイトルを変更する
   *
   * @param title 変更後のタイトル名
   */
  async getRenameTitle(title: string) {
    await this.doc.updateProperties({ title });
  }

  /**
   * 新規シートを追加する
   *
   * @param sheetName シート名
   * @param headerValues ヘッダの値
   * @returns 追加したシート
   */
  async addSheet(sheetName: string, headerValues?: string[]): Promise<GoogleSpreadsheetWorksheet> {
    return await this.doc.addSheet({ title: sheetName, headerValues });
  }

  /**
   * 引数で渡したシート名を削除する。
   *
   * @param sheetTitle 削除対象のシート名
   */
  async deleteSheetByTitle(sheetTitle: string) {
    const sheet = this.doc.sheetsByTitle[sheetTitle];

    if (!sheet) {
      return;
    }
    await sheet.delete();
  }

  /**
   * 全てのシートを削除する。
   */
  async deleteAllSheet() {
    const sheets = this.doc.sheetsByIndex;

    Promise.all(sheets.map((s) => s.delete()));
  }

  /**
   * sheet名の一覧を取得する。
   */
  async sheetNames(): Promise<string[]> {
    return this.doc.sheetsByIndex.map((sheet) => sheet.title);
  }

  /**
   * 行を追加する
   *
   * @param sheetTitle シート名
   * @param values 追加する行の値
   */
  async addRow(sheetTitle: string, values: string[] | Record<string, string | number | boolean>) {
    const sheet = this.doc.sheetsByTitle[sheetTitle];

    if (!sheet) {
      return;
    }
    await sheet.addRow(values);
  }

  /**
   * 複数行を追加する
   *
   * @param sheetTitle シート名
   * @param values 追加する行の値の配列
   */
  async addRows(sheetTitle: string, values: (string[] | Record<string, string | number | boolean>)[]) {
    const sheet = this.doc.sheetsByTitle[sheetTitle];

    if (!sheet) {
      return;
    }
    await sheet.addRows(values);
  }

  /**
   * 行の一覧を取得する。
   *
   * @param sheetTitle シート名
   * @param header 項目を取得するヘッダーを指定する
   */
  async getRows(sheetTitle: string, header: string[]) {
    const sheet = this.doc.sheetsByTitle[sheetTitle];

    if (!sheet) {
      return [];
    }
    const rows = await sheet.getRows();

    return rows.map((row) => header.map((h) => row[h]));
  }

  /**
   * ヘッが行を取得する。
   *
   * @param sheetTitle シート名
   * @returns ヘッダの値の配列
   */
  getHeader(sheetTitle: string) {
    const sheet = this.doc.sheetsByTitle[sheetTitle];

    if (!sheet) {
      return [];
    }
    return sheet.headerValues;
  }
}