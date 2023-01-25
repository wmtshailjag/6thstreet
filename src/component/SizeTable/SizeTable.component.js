import { PureComponent, Fragment } from "react";

import { isArabic } from "Util/App";

import {
  CM_TO_INCH,
  UK_SIZE_CM,
  GENDERS,
  BRANDTITLE,
} from "./SizeTable.config";

import {
  MENS_CLOTHING_SIZE,
  MENS_JEANS_SIZE,
  MENS_SHOES_SIZE,
  MENS_SHOES_BRNANDS,
  MENS_ALDO_SHOES_SIZE,
  MENS_DUNE_SHOES_SIZE,
  MENS_NINEWEST_SHOES_SIZE,
  MENS_CLOTHING_BRNANDS,
  MENS_LEVIS_CLOTHING_SIZE,
} from "./MenSizeTable.config";
import {
  WOMENS_SHOES_BRNANDS,
  WOMENS_ALDO_SHOES_SIZE,
  WOMENS_DUNE_SHOES_SIZE,
  WOMENS_NINEWEST_SHOES_SIZE,
  WOMENS_CLOTHING_SIZE,
  WOMENS_JEANS_SIZE,
  WOMENS_SHOES_SIZE,
} from "./WomenSizeTable.config";

import {
  KIDS_CLOTHING_SIZE,
  KIDS_SHOES_SIZE,
  KIDS_ADULT_SHOES_SIZE,
} from "./KidsSizeTable.config";
import "./SizeTable.style";

export class SizeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isCm: true,
      isArabic: isArabic(),
    };
    this.renderGenderWise = this.renderGenderWise.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderMensClothingRows = this.renderMensClothingRows.bind(this);
    this.multipleGenderSize = this.multipleGenderSize.bind(this);
    this.validateGenderSizeAvailable =
      this.validateGenderSizeAvailable.bind(this);
    this.isBrandCheck = this.isBrandCheck.bind(this);
  }

  handleClick = () => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  };

  getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }
  isBrandCheck = () => {
    const { brand, gender } = this.props;
    let isCheck = false;
    if (
      this.womensShoesByBrands[brand] &&
      this.womensShoesByBrands[brand].length > 0 &&
      (gender === "Women" || gender === "نساء")
    ) {
      isCheck = true;
    }
    if (
      this.mensShoesByBrands[brand] &&
      this.mensShoesByBrands[brand].length > 0 &&
      (gender === "Men" || gender === "رجال")
    ) {
      isCheck = true;
    }
    return isCheck;
  };
  mensShoesByBrands = {
    [MENS_SHOES_BRNANDS.aldo]: MENS_ALDO_SHOES_SIZE,
    [MENS_SHOES_BRNANDS.dune]: MENS_DUNE_SHOES_SIZE,
    [MENS_SHOES_BRNANDS.ninewest]: MENS_NINEWEST_SHOES_SIZE,
    [MENS_SHOES_BRNANDS.aldo_ar]: MENS_ALDO_SHOES_SIZE,
    [MENS_SHOES_BRNANDS.dune_ar]: MENS_DUNE_SHOES_SIZE,
    [MENS_SHOES_BRNANDS.ninewest_ar]: MENS_NINEWEST_SHOES_SIZE,
  };
  womensShoesByBrands = {
    [WOMENS_SHOES_BRNANDS.aldo]: WOMENS_ALDO_SHOES_SIZE,
    [WOMENS_SHOES_BRNANDS.dune]: WOMENS_DUNE_SHOES_SIZE,
    [WOMENS_SHOES_BRNANDS.ninewest]: WOMENS_NINEWEST_SHOES_SIZE,
    [WOMENS_SHOES_BRNANDS.aldo_ar]: WOMENS_ALDO_SHOES_SIZE,
    [WOMENS_SHOES_BRNANDS.dune_ar]: WOMENS_DUNE_SHOES_SIZE,
    [WOMENS_SHOES_BRNANDS.ninewest_ar]: WOMENS_NINEWEST_SHOES_SIZE,
  };

  mensClothByBrands = {
    [MENS_CLOTHING_BRNANDS.levis]: MENS_LEVIS_CLOTHING_SIZE,
  };

  renderTableRow = (row, i) => {
    const { size, bust, waist } = row;
    const { isCm } = this.state;

    if (isCm) {
      return (
        <tr key={i}>
          <td mix={{ block: "SizeTable", elem: "TableCell" }}>{size}</td>
          <td mix={{ block: "SizeTable", elem: "TableCell" }}>
            {(bust * CM_TO_INCH).toFixed(2)}
          </td>
          <td mix={{ block: "SizeTable", elem: "TableCell" }}>
            {(waist * CM_TO_INCH).toFixed(2)}
          </td>
        </tr>
      );
    }

    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{size}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{bust}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{waist}</td>
      </tr>
    );
  };

  renderMensClothing() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("MEN’S CLOTHING SIZE GUIDE")}
        </h1>

        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "LongCell" }}>
                {__("International")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("S")}
              </td>
              <td
                colspan="2"
                mix={{ block: "SizeTable", elem: "TableMergeCellTop" }}
              >
                {__("M")}
              </td>
              <td
                colspan="2"
                mix={{ block: "SizeTable", elem: "TableMergeCellTop" }}
              >
                {__("L")}
              </td>
              <td
                colspan="2"
                mix={{ block: "SizeTable", elem: "TableMergeCellTop" }}
              >
                {__("XL")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderMensClothingRows()}</tbody>
        </table>
      </>
    );
  }
  renderMensClothingRows() {
    // const CLOTH_SIZE_LIST = this.mensClothByBrands[this.props.brand] || MENS_CLOTHING_SIZE
    const rows = MENS_CLOTHING_SIZE.map(this.renderMensClothingRow);
    return rows;
  }
  renderMensClothingRow(row, i) {
    const { international, s, m, l, xl } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{international}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{s}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{m[0]}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{m[1]}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{l[0]}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{l[1]}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{xl[0]}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{xl[1]}</td>
      </tr>
    );
  }
  renderMensShoes() {
    let { gender, brand } = this.props;
    if (
      this.isBrandCheck() === true &&
      (gender === "Women" || gender === "نساء")
    ) {
      return "";
    }
    let title = "MEN’S SHOES SIZE GUIDE";
    if (this.isBrandCheck() === true) {
      title = BRANDTITLE[brand] + title;
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>{title}</h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("EU")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>UK</td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("US")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderMensShoesRows()}</tbody>
        </table>
      </>
    );
  }

  renderMensShoesRow(row, i) {
    const { EU, US, UK } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{EU}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{UK}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{US}</td>
      </tr>
    );
  }

  renderMensShoesRows() {
    const { brand } = this.props;
    const SHOES_SIZE_LIST = this.mensShoesByBrands[brand] || MENS_SHOES_SIZE;
    const rows =
      SHOES_SIZE_LIST && SHOES_SIZE_LIST.map(this.renderMensShoesRow);
    return rows;
  }
  renderMensJeans() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("MEN’S JEANS SIZE GUIDE")}
        </h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("JEANS")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("WAIST (CM)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("WAIST (INCH)")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderMensJeansRows()}</tbody>
        </table>
      </>
    );
  }

  renderMensJeansRow(row, i) {
    const { JEANS, WAIST_CM, WAIST_INCH } = row;

    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{JEANS}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WAIST_CM}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WAIST_INCH}</td>
      </tr>
    );
  }

  renderMensJeansRows() {
    const rows = MENS_JEANS_SIZE.map(this.renderMensJeansRow);
    return rows;
  }

  renderWomensClothing() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("WOMEN’S CLOTHING SIZE GUIDE")}
        </h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "LongCell" }}>
                {__("International")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("UK")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("EU")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("US")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Chest (CM)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Waist (CM)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Hip (CM)")}
              </td>
            </tr>
          </thead>
          <tbody>{this.rendeWomensClothingRows()}</tbody>
        </table>
      </>
    );
  }

  rendeWomensClothingRow(row, i) {
    const { international, UK, EU, US, Chest, Waist, Hip } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{international}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{UK}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{EU}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{US}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{Chest}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{Waist}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{Hip}</td>
      </tr>
    );
  }

  rendeWomensClothingRows() {
    const rows = WOMENS_CLOTHING_SIZE.map(this.rendeWomensClothingRow);
    return rows;
  }

  renderWomensJeans() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("WOMEN’S JEANS SIZE GUIDE")}
        </h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("JEANS")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("WAIST (Cm)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Waist (Inch)")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderWomensJeansRows()}</tbody>
        </table>
      </>
    );
  }

  renderWomensJeansRow(row, i) {
    const { JEANS, WAIST_CM, WAIST_INCH } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{JEANS}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WAIST_CM}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WAIST_INCH}</td>
      </tr>
    );
  }
  renderWomensJeansRows() {
    const rows = WOMENS_JEANS_SIZE.map(this.renderWomensJeansRow);
    return rows;
  }
  renderWomensShoes() {
    const { brand, gender } = this.props;
    if (
      this.isBrandCheck() === true &&
      (gender === "Men" || gender === "رجال")
    ) {
      return "";
    }
    const selectBrand = this.womensShoesByBrands[brand];
    let extraTh = false;
    if (selectBrand && selectBrand.length > 0) {
      let { CM } = selectBrand[0];
      extraTh = CM ? true : extraTh;
    }
    let title = "WOMEN’S SHOES SIZE GUIDE";
    if (this.isBrandCheck() === true) {
      title = BRANDTITLE[brand] + title;
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>{title}</h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("EU")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>UK</td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("US")}
              </td>
              {extraTh ? (
                <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                  {__("CM")}
                </td>
              ) : (
                ""
              )}
            </tr>
          </thead>
          <tbody>{this.renderWomensShoesRows()}</tbody>
        </table>
      </>
    );
  }

  renderWomensShoesRow(row, i) {
    const { EU, US, UK, CM } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{EU}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{UK}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{US}</td>
        {CM ? (
          <td mix={{ block: "SizeTable", elem: "TableCell" }}>{CM}</td>
        ) : (
          ""
        )}
      </tr>
    );
  }

  renderWomensShoesRows() {
    const { brand } = this.props;
    const SHOES_SIZE_LIST =
      this.womensShoesByBrands[brand] || WOMENS_SHOES_SIZE;
    const rows =
      SHOES_SIZE_LIST && SHOES_SIZE_LIST.map(this.renderWomensShoesRow);
    return rows;
  }

  renderKidsClothing() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("KID’S CLOTHING SIZE GUIDE")}
        </h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "LongCell" }}>
                {__("International Sizes")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Height (in)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Height (cm)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Weight (lb)")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("Weight (kg)")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderKidsClothingRows()}</tbody>
        </table>
      </>
    );
  }

  renderInnerRow(row, i) {
    const { type, HEIGHT_CM, HEIGHT_INCH, WEIGHT_LB, WEIGHT_KG } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{type}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{HEIGHT_INCH}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{HEIGHT_CM}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WEIGHT_LB}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{WEIGHT_KG}</td>
      </tr>
    );
  }
  renderInnerRows(data) {
    const rows = data.map(this.renderInnerRow);
    return rows;
  }

  check() {}
  renderKidsClothingRow = (row, i) => {
    const { type, data } = row;
    const innerRows = this.renderInnerRows(data);

    return (
      <Fragment key={i}>
        <tr key={i}>
          <td
            colSpan="5"
            mix={{ block: "SizeTable", elem: "TableCellHeading" }}
          >
            {type}
          </td>
        </tr>
        {innerRows}
      </Fragment>
    );
  };
  renderKidsClothingRows() {
    const rows = KIDS_CLOTHING_SIZE.map(this.renderKidsClothingRow);
    return rows;
  }

  renderKidsShoes() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>
          {__("KID’S SHOES SIZE GUIDE")}
        </h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("EU")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("US")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("UK")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderKidsShoesRows()}</tbody>
        </table>
      </>
    );
  }

  renderKidsShoesRow(row, i) {
    const { EU, US, UK } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{EU}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{US}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{UK}</td>
      </tr>
    );
  }

  renderKidsShoesRows() {
    const rows = KIDS_SHOES_SIZE.map(this.renderKidsShoesRow);
    return rows;
  }

  renderKidsAdultShoes() {
    if (this.isBrandCheck() === true) {
      return "";
    }
    return (
      <>
        <h1 mix={{ block: "SizeTable", elem: "Title" }}>{__("ADULT SIZES")}</h1>
        <table mix={{ block: "SizeTable", elem: "Table" }}>
          <thead>
            <tr mix={{ block: "SizeTable", elem: "TopRow" }}>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("EU")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("US")}
              </td>
              <td mix={{ block: "SizeTable", elem: "TableCellTop" }}>
                {__("UK")}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderKidsAdultShoesRows()}</tbody>
        </table>
      </>
    );
  }

  renderKidsAdultShoesRow(row, i) {
    const { EU, US, UK } = row;
    return (
      <tr key={i}>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{EU}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{US}</td>
        <td mix={{ block: "SizeTable", elem: "TableCell" }}>{UK}</td>
      </tr>
    );
  }

  renderKidsAdultShoesRows() {
    const rows = KIDS_ADULT_SHOES_SIZE.map(this.renderKidsShoesRow);
    return rows;
  }
  renderTableRows() {
    const rows = UK_SIZE_CM.map(this.renderTableRow);
    return rows;
  }

  SwitchToCm = () => {
    this.setState({ isCm: true });
  };

  SwitchToInch = () => {
    this.setState({ isCm: false });
  };

  genderToSizeMap = {
    [GENDERS.men]: [
      this.renderMensClothing(),
      this.renderMensJeans(),
      this.renderMensShoes(),
    ],
    [GENDERS.mens]: [
      this.renderMensClothing(),
      this.renderMensJeans(),
      this.renderMensShoes(),
    ],
    [GENDERS.women]: [
      this.renderWomensClothing(),
      this.renderWomensJeans(),
      this.renderWomensShoes(),
    ],
    [GENDERS.ladies]: [
      this.renderWomensClothing(),
      this.renderWomensJeans(),
      this.renderWomensShoes(),
    ],
    [GENDERS.unisex]: [
      this.renderMensClothing(),
      this.renderMensJeans(),
      this.renderMensShoes(),
      this.renderWomensClothing(),
      this.renderWomensJeans(),
      this.renderWomensShoes(),
    ],
    [GENDERS.kids]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.babyBoy]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.boy]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.boys]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.babyGirl]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.girl]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
    [GENDERS.infant]: [
      this.renderKidsClothing(),
      this.renderKidsShoes(),
      this.renderKidsAdultShoes(),
    ],
  };

  renderGenderWise(funcArray) {
    const [a, b, c] = funcArray;
    return (
      <>
        {a}
        {b}
        {c}
      </>
    );
  }

  multipleGenderSize(gender, i) {
    gender = gender.toLowerCase();
    return (
      <div key={i}>{this.renderGenderWise(this.genderToSizeMap[gender])}</div>
    );
  }
  multipleGenderSizes(data) {
    const rows = data.map(this.multipleGenderSize);
    return rows;
  }

  validateGenderSizeAvailable(gender) {
    if (Array.isArray(gender)) {
      // check for all genders
      let matched = true;
      for (let i = 0; i < gender.length; i++) {
        if (!this.genderToSizeMap[gender[i].toLowerCase()]) {
          matched = false;
          break;
        }
      }
      if (!matched) {
        return [GENDERS.men, GENDERS.women, GENDERS.kids];
      } else {
        return gender;
      }
    } else if (gender) {
      // check for specific gender
      if (this.genderToSizeMap[gender.toLowerCase()]) {
        return gender;
      } else {
        return [GENDERS.men, GENDERS.women, GENDERS.kids];
      }
    } else {
      return [GENDERS.men, GENDERS.women, GENDERS.kids];
    }
  }
  renderTable() {
    let gender = this.props.gender;
    gender = this.validateGenderSizeAvailable(gender);

    if (Array.isArray(gender)) {
      return <>{this.multipleGenderSizes(gender)}</>;
    } else {
      gender = gender.toLowerCase();
      return <>{this.renderGenderWise(this.genderToSizeMap[gender])}</>;
    }
    // if(this.props.currentContentGender == 'men'){
    //     return (
    //         <>
    //         {this.renderMensClothing()}
    //         {this.renderMensShoes()}
    //         {this.renderMensJeans()}
    //         </>
    //     )
    // }else if(this.props.currentContentGender == 'women'){
    //     return (
    //         <>
    //         {this.renderWomensClothing()}
    //         {this.renderWomensJeans()}
    //         {this.renderWomensShoes()}
    //         </>
    //     )
    // }else if(this.props.currentContentGender == 'kids'){
    //     return (
    //         <>
    //           {this.renderKidsClothing()}
    //           {this.renderKidsShoes()}
    //           {this.renderKidsAdultShoes()}
    //         </>
    //     )
    // }
  }

  render() {
    const { isCm, isArabic } = this.state;

    return (
      <div block="SizeTable" mods={{ isArabic }}>
        {/* <div mix={ { block: 'SizeTable', elem: 'ButtonContainer' } }>
                    <button
                      onClick={ this.SwitchToCm }
                      mix={ { block: 'SizeTable', elem: 'ButtonCm', mods: { isCm } } }
                    >
                        { __('Cm') }
                    </button>
                    <button
                      onClick={ this.SwitchToInch }
                      mix={ { block: 'SizeTable', elem: 'ButtonInch', mods: { isCm } } }
                    >
                        { __('Inches') }
                    </button>
                </div> */}

        {this.renderTable()}
        {/* <table mix={ { block: 'SizeTable', elem: 'Table' } }> */}
        {/* <thead>
                        <tr mix={ { block: 'SizeTable', elem: 'TopRow' } }>
                            <td mix={ { block: 'SizeTable', elem: 'TableCellTop' } }>{ __('Size') }</td>
                            <td mix={ { block: 'SizeTable', elem: 'TableCellTop' } }>{ __('Bust') }</td>
                            <td mix={ { block: 'SizeTable', elem: 'TableCellTop' } }>{ __('Waist') }</td>
                        </tr>
                    </thead>
                    <tbody>
                        { this.renderTableRows() }
                    </tbody> */}

        {/* </table> */}
      </div>
    );
  }
}

export default SizeTable;
