import { PureComponent } from "react";
import WebUrlParser from "Util/API/helper/WebUrlParser";
import { connect } from "react-redux";
import "./PLPLoadMore.style";
import { setProductLoading } from "Store/PLP/PLP.action";

export const mapStateToProps = (_state) => ({
    productMeta: _state.PLP.meta,
});

export const mapDispatchToProps = (_dispatch) => ({
    setProductLoading: (isLoading) => _dispatch(setProductLoading(isLoading)),
});
class PLPLoadMore extends PureComponent {
    constructor(props) {
        super(props);
        //this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    handleLoadMore =  (e) => {
        e.preventDefault();
        const { pageKey, setProductLoading } = this.props;
        const pageIndex = parseInt(pageKey) + 1;
        WebUrlParser.setPage(pageIndex);
        setProductLoading(true);
    }
    
    render() {
        const pageKey = parseInt(this.props.pageKey);
        const {
            productMeta: { hits_count: totalProducts, limit, page, page_count },
        } = this.props;
        let loadedProduct, progressWidth;
        let disablebtn = false;
        if (pageKey == 0) {
            loadedProduct = limit;
        }
        if (pageKey == page_count - 1) {
            disablebtn = true;
            loadedProduct =
                limit * (page_count - 1) + (totalProducts - (page_count - 1) * limit);
        }
        if (pageKey !== 0 && pageKey !== page_count - 1) {
            loadedProduct = limit * pageKey + 30;
        }
        progressWidth = (loadedProduct * 100) / totalProducts;
        if(totalProducts  >= 30){
            return (                             
                <div block="Product-LoadMore">
                    {totalProducts && 
                        <>
                            <div block="Product-Loaded-Info">                                
                                {__("You’ve viewed %s of %s products", loadedProduct, totalProducts)}
                            </div>
    
                            <div block="Product-ProgressBar">
                                <div block="Product-ProgressBar-Container">
                                    <div
                                        block="Product-ProgressBar-Bar"
                                        style={{ width: `${progressWidth}%` }}
                                    ></div>
                                </div>
                            </div>
                        </>
                    }
    
                    <div block="LoadMore">
                        <button
                            block="button"
                            onClick={(e) => this.handleLoadMore(e)}
                            disabled={disablebtn || this.props.productLoad}
                            ref={this.buttonRef}
                        >
                            {disablebtn ? __("All Products Loaded") : this.props.productLoad ? __("Loading...") : __("Load More")}
                        </button>
                    </div>
                </div>
            );
          } else{
            return  (null);
          }
        
    }
}

// export default PLPLoadMore;
export default connect(mapStateToProps, mapDispatchToProps)(PLPLoadMore);
