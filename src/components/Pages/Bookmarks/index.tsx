import React, { useState, useEffect, SyntheticEvent } from 'react';
import { IformatedQuestion } from '../../../helpers/data/index';
import { getBookmarkedList } from '../../../services'; 
import QuestionCard from '../../QuestionCard';

const Bookmarks = () => {
    const [data, setData] = useState<IformatedQuestion[]>([]);
    const [currentIndex, updateCurrent] = useState<number>(0);
    const [hasSubmit, updateHasSubmit] = useState<boolean>(false);
  
    useEffect(() => {
        const fetchData = async () => {
            let databookmarkedQuestionss = await getBookmarkedList();
            setData(databookmarkedQuestionss);
        }
        fetchData();
    }, []);

    const prev = (e: SyntheticEvent) => {
        // reset hasSubmit to false
        updateHasSubmit(false);

        updateCurrent(currentIndex - 1);
    }

    const next = (e: SyntheticEvent) => {
        // reset hasSubmit to false
        updateHasSubmit(false);

        const newIndex = currentIndex + 1;
        updateCurrent(newIndex);
    }

    const updateAnsArray = (/* userChooseAns: string | number, questionIndex: number */):void => {
        // const isCorrect = Number(data[currentIndex].ans) === Number(userChooseAns);
        updateHasSubmit(true);
    }

    const currentQuestion = data?.[currentIndex] ?? null;
  
    let renderContent = null;

    if (data.length === 0) {
        renderContent = (<div className="text-center m-4">尚未存有書籤的題目</div>);
    } else {
        renderContent = (
            <div className="container container-700 mt-3 mb-5">
                <nav className="navbar navbar-light" style={{backgroundColor: '#ebe9e6'}}>
                    <div>我的書籤 {currentIndex + 1}/{data.length}</div>
                </nav>
                <div className="exams-wrap">
                    <QuestionCard
                        key={currentIndex}
                        seq={currentIndex}
                        data={currentQuestion}
                        haveSubmitted={hasSubmit}
                        onAnsChanged={updateAnsArray}
                    />
                </div>
                <div className="ans-btn-fixed">
                    <div className="container container-700">
                        <div className="row">
                            <div className="col-6 text-left">
                                <button className="ans-btn" onClick={(e) => prev(e)} disabled={currentIndex <= 0}>上一題 Prev</button>
                            </div>
                            <div className="col-6 text-right">
                                <button className="ans-btn" onClick={(e) => next(e)} disabled={currentIndex +1 === data.length}>下一題 Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return renderContent;
}

export default Bookmarks;

