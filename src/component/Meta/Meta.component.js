import PropTypes from "prop-types";

import { Meta as SourceMeta } from "SourceComponent/Meta/Meta.component";

export class Meta extends SourceMeta {
  static propTypes = {
    ...SourceMeta.propTypes,
    hreflangs: PropTypes.arrayOf(
      PropTypes.shape({
        hreflang: PropTypes.string,
        href: PropTypes.string,
      })
    ).isRequired,
  };

  clearTitle() {
    const title = document.querySelectorAll("title");
    if (title && title.length) {
      title.forEach((tag) => tag.remove());
    }
  }

  clearDescription() {
    const description = document.querySelectorAll("[name=description]");
    if (description && description.length) {
      description.forEach((tag) => tag.remove());
    }
  }

  clearKeywords() {
    const keywords = document.querySelectorAll("[name=keywords]");
    if (keywords && keywords.length) {
      keywords.forEach((tag) => tag.remove());
    }
  }

  renderHreflang = ({ hreflang, href }, i) => (
    <link rel="alternate" hrefLang={hreflang} href={href} key={i} />
  );

  renderHreflangs() {
    const { hreflangs = [] } = this.props;

    if (!hreflangs.length) {
      return null;
    }

    return hreflangs.map(this.renderHreflang);
  }

  clearMetadata() {
    clearTitle();
    clearDescription();
    clearKeywords();
  }

  renderTitle() {
    const { default_title, title_prefix, title_suffix, title } = this.props;

    const titlePrefix = title_prefix ? `${title_prefix} | ` : "";
    const titleSuffix = title_suffix ? ` | ${title_suffix}` : "";

    const metaTitle = (str) => {
      const regularTitle = {
        containString : /-/,
      }
      const expMatch ={};
      expMatch.containString = regularTitle.containString.test(str);
      return expMatch;
    }
    const validateTitle = (titleValue) =>{
      const titleSplit = titleValue.split('-');
      const titleJoin = titleSplit.join(' ');
      return titleJoin;
    }
    const titleCase = (str) => {
      var splitStr = str.split(' ');
      for (var i = 0; i < splitStr.length; i++) {
          splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
      }
      return splitStr.join(' '); 
   }
   
    const pageMetaTitle = metaTitle(title);
    const defaultMetaTitle = metaTitle(default_title);
    const pageTitle = validateTitle(title);
    const titleDefault = validateTitle(default_title);

    const oldtitleTags = document.querySelectorAll("title");
    if (oldtitleTags && oldtitleTags.length) {
      oldtitleTags.forEach((tag) => tag.remove());
    }

    const newTitleTag = document.createElement("title");
    if (pageMetaTitle || defaultMetaTitle == 1){
      newTitleTag.innerHTML = `${titlePrefix}${
        titleCase(pageTitle) || titleCase(titleDefault)
      }${titleSuffix}`;
    }
    else{
      newTitleTag.innerHTML = `${titlePrefix}${
        title || default_title
      }${titleSuffix}`;
    }
    document.head.appendChild(newTitleTag);
  }

  renderMeta() {
    const { metadata = [] } = this.props;
    return (
      <>
        {this.renderTitle()}
        {this.renderCanonical()}
        {this.renderHreflangs()}
        {metadata.map((tag) => {
          const tags = document.querySelectorAll(`[name="${tag.name}"]` );
          const propTags = document.querySelectorAll(`[property="${tag.name}"]`);
          
          if (tags && tags.length) {
            tags.forEach((tag) => tag.remove());
          }
          if (propTags && propTags.length) {
            propTags.forEach((tag) => tag.remove());
          }
          const newTag = document.createElement("meta");
          newTag.key = tag.name || tag.property;
          Object.keys(tag).map((key) => (newTag[key] = tag[key]));
          document.head.appendChild(newTag);
          
          const findOGTitle = document.querySelectorAll(`[name="og:title"]` );
          const findOGDesc = document.querySelectorAll(`[name="og:description"]` );
          if (findOGTitle && findOGTitle.length) {
            findOGTitle.forEach((tag) => {
              tag.setAttribute("property", "og:title");
              tag.removeAttribute("name");
            });
          }
          if (findOGDesc && findOGDesc.length) {
            findOGDesc.forEach((tag) => {
              tag.setAttribute("property", "og:description");
              tag.removeAttribute("name");
            });
          }
          
        })}
      </>
    );
  }
}

export default Meta;
