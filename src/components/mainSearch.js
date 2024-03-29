import React from 'react';

import './../App.css';

import MainStore from './store.js';
import {observer} from 'mobx-react';
import axios from 'axios';

@observer
class MainSection extends React.Component{
  constructor(props){
        super(props);
        this.state = {  
            showPropertyTypes: false,
            showBedroomTypes: false,
            showPrice: false,
            showAdvanced: false,
            PropertyTypes :[
                {item: "Villa", selected: true},
                {item: "Apartment", selected : true}, 
                {item: "Residance", selected: false},
                {item: "Land", selected: false}, 
                {item: "All Property Types", selected: true} 
            ],
            cityArr : ["Antalya", "Izmir", "Istanbul", "Trabzon", "Bursa"],
            cCity: "Antalya",
            currentImageIndex: 0,
            imageSwitchTimer: undefined,
            cities : undefined,
            searchLocationResults: [],
            selectedCityID: undefined,
            selectedDistrictID: undefined,
            selectedPlaceholder: undefined,
            __searchbarinput: '',
            MinPrice : 0,
            MaxPrice : 20000000000
        }
    }
    componentDidMount() {
        var vm = this
        this.setState({ imageSwitchTimer: setInterval(() => {
            vm.switchNextImage()
        }, 4000) })
    }

    componentWillMount() {
        this.getCities()
    }

    constructLocationObjectArray = () => {
        let results = []

        if (this.state.cities === undefined)
            return []

        this.state.cities.forEach(city => {
            city.districts.forEach(district => {
                results.push({
                    repr: city.name + ", " + district[1],
                    cityId: city.id,
                    id: district[0]
                })
            })
        })

        return results
    }

    getCities = () => {
        var vm = this;
        axios.get("http://138.201.16.232/properties/cities/")
        .then(res => {
            MainStore.cities = [
                ...res.data
            ]
            
            vm.setState({cities: res.data})
        })
    }

    getSearchResults = (event) => {
        this.setState({__searchbarinput: event.target.value})

        var vm = this
        var query = event.target.value.trim()

        console.log('query: "' + query + '"')

        if (query == "") {
            this.setState({ searchLocationResults: this.constructLocationObjectArray() })
            return
        }

        axios.get("http://138.201.16.232/properties/search-locations/?q="+query)
        .then(res => {
            let results = []

            res.data.results.forEach(district => {
                results.push({
                    repr: district.city_name + ", " + district.name,
                    cityId: district.city_id,
                    id: district.id
                })
            })

            vm.setState({ searchLocationResults: results })
            console.log(results)
        })
    }

    updateSearchResults = (event) => {
        var query = event.target.value.trim()

        if (query == "") {
            this.setState({ searchLocationResults: this.constructLocationObjectArray() })
        } else {
            this.getSearchResults(event)
        }
    }

    clearSearchResults = () => {
        this.setState({ searchLocationResults: [] })
    }

    updateSelectedLocation = (cid, did, ph) => {
        console.log(cid, did,ph)

        this.setState({
            selectedCityID: cid,
            selectedDistrictID: did,
            selectedPlaceholder: ph,
            __searchbarinput: ''
        })

        this.clearSearchResults()
        console.log(this.state.selectedPlaceholder)
    }

    onSearchHandler = () => {
        if (this.state.selectedCityID !== undefined) {
            if (this.state.selectedDistrictID !== undefined) {
                window.location = '/List?city='+this.state.selectedCityID+'&district='+this.state.selectedDistrictID+'&page=1' + "&priceMin=" +this.state.MinPrice + "&priceMax=" + this.state.MaxPrice
            } else {
                window.location = '/City?city='+this.state.selectedCityID+'&page=1' +"&priceMin=" + this.state.MinPrice + "&priceMax=" + this.state.MaxPrice
            }
        }
    }

    switchNextImage = () => {
        let currentImageIndex = (this.state.currentImageIndex + 1) % this.state.cities.length
        this.setState({ currentImageIndex, cCity: this.state.cities[currentImageIndex].name })
    }

    switchToImageByIndex = (indx) => {
        if (indx < 0 || indx >= this.state.cities.length) {
            console.log("Invalid image index:", indx, ", ( this.state.cities.length =", this.state.cities.length, ")")
            return
        }

        var vm = this

        if (this.state.imageSwitchTimer !== undefined) {
            clearInterval(this.state.imageSwitchTimer)
        }

        this.setState({
            currentImageIndex: indx,
            cCity: this.state.cities[indx].name,
            
            imageSwitchTimer: setInterval(() => {
                vm.switchNextImage()
            }, 4000)
        })
    }

    handlePropertyType = (item) => {
        let selected = item.selected 
        item.selected = !selected
    }

    showPropertyType =() =>{
        let show2 = this.state.showPropertyTypes
        this.setState({showPropertyTypes: !show2})
        this.setState({showPrice: false})
        this.setState({showBedroomTypes: false})
    } 

    showBedroomType =() =>{
        let show2 = this.state.showBedroomTypes
        this.setState({showBedroomTypes: !show2})
        this.setState({showPropertyTypes: false})
        this.setState({showPrice: false})
    } 

    showPrice = () =>{
        let show1 = this.state.showPrice
        this.setState({showPrice: !show1})
        this.setState({showPropertyTypes: false})
        this.setState({showBedroomTypes: false})
    } 

    showAdvanced = () => {
        let show = this.state.showAdvanced
        this.setState({showAdvanced: !show})
    }

    updateMinPrice = (input) => {
        console.log(input.target.value)
        if(input.target.value >= this.state.MaxPrice){
            this.setState({MinPrice: Number(input.target.value)})
            this.setState({MaxPrice : Number(input.target.value)})
        }
        else {
            this.setState({MinPrice: Number(input.target.value)})
        }
        
    }
    updateMaxPrice = (input) => {
        if(input.target.value <= this.state.MinPrice){
            this.setState({MinPrice : Number(input.target.value)})
            this.setState({MaxPrice: Number(input.target.value)})
        }
        else {
            this.setState({MaxPrice: Number(input.target.value)})
        }
       
    }

    render(){
        const Price = () => {
            let output = null
            if(this.state.showPrice){
                let min = 2000000
                output = (
                    <div class="form-opener">
                        <div class="slider">
                            <div class="title">
                                Minimum Price
                            </div>

                            <div class="input">
                                <input type="range" class="min-range" step="50000" value={this.state.MinPrice} min = "0" max="20000000" onChange = {(data) => this.updateMinPrice(data)} />

                                <div class="values row">
                                    <div class="col-6 text-left">
                                        <i class="fa fa-lira-sign"></i>
                                        <span class="min">
                                            {this.state.MinPrice.toLocaleString()}
                                        </span>
                                    </div>

                                    <div class="col-6 text-right">
                                        <i class="fa fa-lira-sign"></i>
                                        <span class="max">20M</span>
                                    </div>
                                </div>
                            </div>

                            <div class="title">
                                Maksimum Price
                            </div>

                            <div class="input">
                                <input type="range" class="max-range" step="50000" value = {this.state.MaxPrice} min="200000" value={this.state.MaxPrice} max="20000000" onChange = {(data) => this.updateMaxPrice(data)} />

                                <div class="values row">
                                    <div class="col-6 text-left">
                                        <i class="fa fa-lira-sign"></i>
                                        <span class="min">
                                            {min.toLocaleString()}
                                        </span>
                                    </div>

                                    <div class="col-6 text-right">
                                        <i class="fa fa-lira-sign"></i>
                                        <span class="max">{this.state.MaxPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )   
            }
            return output
            
        }
        const PropertyTypes = () => {
            let output = null
            if(this.state.showPropertyTypes){
                output = (
                    <div class="form-opener">
                        <div class="select">
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        Villa
                                    </div>
                                </div>
                            </label>

                            <label for="apartment" class="checkbox">
                                <input type="checkbox" name="apartment" id="apartment"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        Apartment
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )
            }
            return output
        }
        const BedroomTypes = () => {
            let output = null
            if(this.state.showBedroomTypes){
                output = (
                    <div class="form-opener">
                        <div class="select">
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        1 Bedroom
                                    </div>
                                </div>
                            </label>
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        2 Bedroom
                                    </div>
                                </div>
                            </label>
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        3 Bedroom
                                    </div>
                                </div>
                            </label>
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        4 Bedroom
                                    </div>
                                </div>
                            </label>
                            <label for="villa" class="checkbox">
                                <input type="checkbox" name="villa" id="villa"/>
                                <div class="checkbox">
                                    <div class="icon">
                                        <i class="fa fa-check"></i>
                                    </div>

                                    <div class="text">
                                        5+ Bedroom
                                    </div>
                                </div>
                            </label>

                        </div>
                    </div>
                )
            }
            return output
        }

        const AdvancedFilter = () => {
            let output = null 
            if(this.state.showAdvanced){
                output = (
                    <div class="form-opener multiple">
                    <div class="multiple-forms row m-0">
                        <div class="form-block first-input col-lg-6 col-12">
                            <div class="form-group">
                                <div class="title">
                                    Property Reference
                                </div>

                                <div class="input">
                                    <input type="text" />
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="title align-top mt-2">Property Reference</div>

                                <div class="input">
                                    <label for="private" class="checkbox">
                                        <input type="checkbox" name="private" id="private" checked />
                                        <div class="checkbox">
                                            <div class="icon">
                                                <i class="fa fa-check"></i>
                                            </div>

                                            <div class="text">
                                                Private
                                            </div>
                                        </div>
                                    </label>

                                    <label for="company" class="checkbox">
                                        <input type="checkbox" name="company" id="company" checked />
                                        <div class="checkbox">
                                            <div class="icon">
                                                <i class="fa fa-check"></i>
                                            </div>

                                            <div class="text">
                                                Company
                                            </div>
                                        </div>
                                    </label>

                                    <label for="offshore" class="checkbox">
                                        <input type="checkbox" name="offshore" id="offshore" checked />
                                        <div class="checkbox">
                                            <div class="icon">
                                                <i class="fa fa-check"></i>
                                            </div>

                                            <div class="text">
                                                Offshore
                                            </div>
                                        </div>
                                    </label>

                                    <label for="developer" class="checkbox">
                                        <input type="checkbox" name="developer" id="developer" checked />
                                        <div class="checkbox">
                                            <div class="icon">
                                                <i class="fa fa-check"></i>
                                            </div>

                                            <div class="text">
                                                Developer
                                            </div>
                                        </div>
                                    </label>

                                    <label for="other" class="checkbox">
                                        <input type="checkbox" name="other" id="other" checked />
                                        <div class="checkbox">
                                            <div class="icon">
                                                <i class="fa fa-check"></i>
                                            </div>

                                            <div class="text">
                                                Other
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="title">
                                    Property Reference
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="title">
                                    Property Reference
                                </div>

                                <div class="input">
                                    <input type="text" placeholder=" Poll, Sea View etc."/>
                                </div>
                            </div>
                        </div>

                        <div class="form-block col-lg-6 col-12">
                            <div class="form-group select-group">
                                <div class="title">
                                    Build Size
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    Plot Size
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    <i class="fa fa-lira-sign"></i> / m2 build
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    <i class="fa fa-lira-sign"></i> / m2 plot
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    <i class="fa fa-lira-sign"></i> / m2 plot
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    Bathroom
                                </div>

                                <div class="input">
                                    <select>
                                        <option value="#">No Min</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>

                                    <span class="seperator">-</span>

                                    <select>
                                        <option value="#">No Max</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group select-group">
                                <div class="title">
                                    Property Reference
                                </div>

                                <div class="input">
                                    <select class="w-100">
                                        <option value="#">Show highest price fist</option>
                                        <option value="#">100</option>
                                        <option value="#">200</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )
            }
            return output;
        }

        return (
            <div> 
                {/* <div className="SliderGallery">
                    <img
                        className="slider-cover-image"
                        src={this.state.cities[this.state.currentImageIndex]}
                    />
                    <div className = "cityContent">
                        <p className= "cityContentHeader">WIDEN YOUR TURKEY</p>
                        <p className = "cityContentHeader2">{this.state.cCity}</p>
                    </div>
                    <p className = "cityContentText">Antalya's warm climate, beautiful beaches and luxury resorts make it the perfect place to spend a hard-earned break, which is why it’s the first place to spring to mind whenever Turks hear the words "summer holiday." With recent investments in golf courses bringing record numbers of visitors to the area, Antalya has a whole host of things to offer, making it an unbeatable holiday destination.</p>
                    <div className = "CityContentProperities">
                        <a href ="/city" className = "CityContentProperitiesText"><span className = "CityContentProperitiesText1" >234</span> PROPERTIES</a>
                        <div>
                            <img className = "CityContentProperitiesIcon" src ={triangle_icon}/>
                        </div>
                    </div>
                    <div className="slider-imageslider" style={styles.slider}>
                        {MainStore.cities.map((uri, index) =>
                             (
                            <div className = "CitySearchIntroductionHeader">
                                <div
                                    style={this.state.currentImageIndex == index ? styles.sliderItemSelected : styles.sliderItem}
                                    onClick={() => {this.switchToImageByIndex(index)}}
                                    className="slider-imagesilder-item"
                                >
                                    {index + 1}
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
                <div id="hero-placeholder">
                    <div id="hero-slider" class="row">
                        <div class="hero-slider owl-carousel col-12 p-0">
                            <div class="item">
                                <div class="slider-item row m-0 align-items-center" style= {{backgroundImage: this.state.cities === undefined ? '' : 'url('+'http://138.201.16.232'+this.state.cities[this.state.currentImageIndex].gallery[0]+')'}}>
                                    <div class="container">
                                        <div class="row align-items-center">
                                            <div class="slider-details col-lg-8 col-12 p-0">
                                                <div class="slider-header col-12">
                                                    <div class="slider-title">
                                                        WIDEN YOUR TURKEY
                                                        <span>{this.state.cCity}</span>
                                                    </div>

                                                    <div class="slider-buttons">
                                                        
                                                            {this.state.cities === undefined ? (
                                                                <a href="#" class="slider-button">
                                                                    <div class="count">
                                                                        <span>234</span>
                                                                        PROPERTIES
                                                                    </div>
                                                                    <div class="icon">
                                                                        <img src="assets/images/icons/caret-arrow-next.png" alt="" />
                                                                    </div>
                                                                </a>
                                                            ) : (
                                                                <a href={"/City?city="+this.state.cities[this.state.currentImageIndex].id+"&page=1"} class="slider-button">
                                                                    <div class="count">
                                                                        <span>{this.state.cities[this.state.currentImageIndex].property_count}</span>
                                                                        PROPERTIES
                                                                    </div>
                                                                    <div class="icon">
                                                                    <img src={require("./../assets/images/icons/caret-arrow-next.png")} alt="" />
                                                                    </div>
                                                                </a>
                                                            )}

                                                            
                                                    </div>
                                                </div>

                                                <div class="slider-desc col-12">
                                                    {this.state.cities === undefined ? '' : this.state.cities[this.state.currentImageIndex].description}
                                                </div>

                                                <div class="mobile-slider-buttons d-lg-none">
                                                    <a href="#" class="slider-button">
                                                        <div class="count">
                                                            <span>234</span>
                                                            PROPERTIES
                                                        </div>

                                                        <div class="icon">
                                                            <img src="assets/images/icons/caret-arrow-next.png" alt="" />
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slider-imageslider" style={styles.slider}>
                        {MainStore.cities.map((uri, index) =>
                             (
                            <div className = "CitySearchIntroductionHeader">
                                <div
                                    style={this.state.currentImageIndex == index ? styles.sliderItemSelected : styles.sliderItem}
                                    onClick={() => {this.switchToImageByIndex(index)}}
                                    className="slider-imagesilder-item"
                                >
                                    {index + 1}
                                    
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div class="hero-search row">
                        <div class="location col-lg-3 col-9 row m-0 align-items-center">
                            <div class="title">Property Turkey for sale</div>
                            <div class="input">
                                <div class="icon">
                                    {this.state.searchLocationResults.length == 0 ? (
                                        <img src={require("./../assets/images/icons/map-marker.png")} alt="" />
                                    ) : (
                                        <div onClick={this.clearSearchResults} style={{fontSize: '16px', color: '#fff', width: '30px', height: '30px', borderRadius: '15px', border: '2px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '20px'}} >^</div>
                                    )} 
                                </div>

                                <input style={{width: '80%'}} value={this.state.__searchbarinput} type="text" placeholder={this.state.selectedPlaceholder === undefined ? "Start typing to select a location" : this.state.selectedPlaceholder} onChange={this.getSearchResults} onFocus={this.updateSearchResults} ></input>
                            </div>
                        </div>

                        <div class="col-lg-8 col-3 row m-0 p-0 align-items-center">
                            <div class="form-box col-lg col-12 row m-0 align-items-center">
                                <div class="form-item" onClick ={()=>this.showPropertyType()}>
                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/home.png")} alt="" />
                                    </div>

                                    <div class="title">
                                        3 Property Types
                                    </div>
                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/chevron-arrow-down.png")} alt="" />
                                    </div>
                                </div>
                                {PropertyTypes()}
                            </div>

                            <div class="form-box col-lg col-12 row m-0 align-items-center">
                                <div class="form-item" onClick ={()=>this.showBedroomType()}>
                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/bedroom.png")} alt="" />
                                    </div>

                                    <div class="title">
                                        All Bedrooms
                                    </div>

                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/chevron-arrow-down.png")} alt=""/>
                                    </div>
                                    {BedroomTypes()}
                                </div>
                                
                            </div>

                            <div class="form-box col-lg col-12 row m-0 align-items-center">
                                <div class="form-item" onClick = {() => {this.showPrice()}}>
                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/wallet.png")} alt="" />
                                    </div>

                                    <div class="title">
                                        Any Price
                                    </div>

                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/chevron-arrow-down.png")} alt=""/>
                                    </div>
                                </div>
                                {Price()}
                            </div>
                            
                            {/* <div class="form-box col-lg col-12 row m-0 align-items-center">
                                <div class="form-item" onClick = {()=>{this.showAdvanced()}}>
                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/filter.png")} alt="" />
                                    </div>

                                    <div class="title">
                                        Advanced Filter
                                    </div>

                                    <div class="icon">
                                        <img src={require("./../assets/images/icons/chevron-arrow-down.png")} alt=""/>
                                    </div>
                                </div>
                                {AdvancedFilter()}
                            </div> */}
                            <button class="col-lg col-12" onClick={this.onSearchHandler}>
                               <img src={require("./../assets/images/icons/search.png")} class="img-fluid" alt="" />
                            </button>
                        </div>
                    </div>

                    {this.state.searchLocationResults.length == 0 ? null : (
                        <div class="search-input-results">
                            {this.state.searchLocationResults.map(res => (
                                <div onClick={this.updateSelectedLocation.bind(this, res.cityId, res.id, res.repr)}>{res.repr}</div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        );
    }
}

const styles = {
    slider: {
        position: 'absolute',
        top: '209px',
        right: '50px',
        width : "100px",
        textAlign: 'center',
        height: '191px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    sliderItem: {
        fontSize: '18.6px',
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: '15px',
        marginTop: '15px',
        right: '64px',
    },
    sliderItemSelected: {
        fontSize: '41px',
        color: '#fff',
        fontWeight: 'bold',
        right: '64px',
    }
    
}

export default MainSection;
