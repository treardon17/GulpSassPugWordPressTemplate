class ParallaxPage{
    constructor(){
        this.previousTop = window.pageYOffset || document.documentElement.scrollTop;
        this.parallaxContainers = [];
        let parallaxContainers = $('.parallax-container');
        for(let i = 0; i < parallaxContainers.length; i++){
            let parallaxElements = $(parallaxContainers[i]).find('.parallax-element');
            let titleHeadings = $(parallaxContainers[i]).find('.title-heading');
            this.parallaxContainers.push({container: parallaxContainers[i], elements: parallaxElements, titleHeadings: titleHeadings, position: $(parallaxContainers[i]).offset().top});
        }
        //set initial position of elements
        this.handleScroll();
        this.currentScrollDirection = 0;
    }

    //This should be placed inside of a $(window).scroll(()=>{})
    handleScroll(){
        if(this.parallaxContainers.length == 0) { return; };
        for(let i = 0; i < this.parallaxContainers.length; i++){
            let container = this.parallaxContainers[i].container;
            let elements = this.parallaxContainers[i].elements;

            //check if the element we're observing is in the current viewport
            this.checkElementInView(container,{
                elementInViewCallback: (percentComplete)=>{
                    let distanceToTravel = $(container).outerHeight() * 0.33;
                    this.moveElements(elements, percentComplete * distanceToTravel);
                }
            });
        }
    }

    moveElements(elements, margin){
        for(let i = 0; i < elements.length; i++){
            $(elements[i]).css({'top': margin + 'px'});
        }
    }

    opacityElements(elements, opacity){
        for(let i = 0; i < elements.length; i++){
            $(elements[i]).css({'opacity': opacity});
        }
    }

    //Checks to see if an element is above, within, or below the current scroll offset
    checkElementInView(elementSelector, cbObject){
        const top  = window.pageYOffset || document.documentElement.scrollTop;    //top of the window
        const windowHeight = $(window).height();
        const bottom = top + windowHeight;                                        //bottom of the window
        

        const element = $(elementSelector);       //div being observed
        const height = $(element).outerHeight();  //height of the element
        const offset = $(element).offset().top;   //the top of the element

        const bottomInView = (bottom >= offset && bottom < offset + height);
        const topInView = (top >= offset && top < offset + height);
        const aboveView = (top - offset < height);
        const belowView = (top > offset + height);
        const viewInViewport = (bottom > offset || top < offset + height);

        //this will prevent the new top from being set 
        if(top % 2 == 0){
            //will be -1 if scrolling down, 1 if scrolling up
            if(this.previousTop < top){
                this.currentScrollDirection = -1;
            }else if(this.previousTop > top){
                this.currentScrollDirection = 1
            }
            //remember where the previous top is
            this.previousTop = top;
        }

        if(topInView){
            //if the top of the viewport is in the middle of the element we're observing
            if(typeof cbObject.middleCallback === 'function'){
                let percentComplete = (top - offset)/height;
                cbObject.middleCallback(percentComplete);
            }
        }else if(aboveView){
            //if the viewport is above the view we're observing
            if(typeof cbObject.aboveCallback === 'function'){
                cbObject.aboveCallback();
            }
        }else if (belowView){
            //if the viewport is below the view we're observing
            if(typeof cbObject.belowCallback === 'function'){
                cbObject.belowCallback();
            }
        }else if(bottomInView){
            //if the bottom of the window is in the middle of the element we're observing
            if(typeof cbObject.bottomProgressCallback === 'function'){
                let percentComplete = (bottom - offset)/height
                cbObject.bottomProgressCallback(percentComplete);
            }
        }

        //if any part of the element is in the view
        if(topInView || viewInViewport || bottomInView){
            if(typeof cbObject.elementInViewCallback === 'function'){
                let percentComplete = (top - offset)/((2*height) + windowHeight);
                cbObject.elementInViewCallback(percentComplete);
            }
        }
    }
}

//when the document has been loaded, make a parallax page
//call the handleScroll function on every scroll event
$(document).ready(()=>{
    let parallax = new ParallaxPage();
    var throttledUpdate = _.throttle(()=>{
        parallax.handleScroll();
    }, 10)

    $(window).scroll(()=>{ 
        throttledUpdate();
    });
});