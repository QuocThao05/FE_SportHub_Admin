import React, { useEffect, useState } from "react";

import {
  Table,
  Tag,
  Button,
  Drawer,
  Descriptions,
  Space,
  Select,
  Input,
  Tooltip,
  message,
  Popconfirm,
} from "antd";

import {
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

import reviewService from "../../services/reviewService";

console.log("reviewService =", reviewService);
console.log("show =", reviewService.show);
import "../../styles/pages/home/ReviewManagement.scss";


const { Option } = Select;



export default function ReviewManagement() {


  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(false);


  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedReview, setSelectedReview] = useState(null);


  const [keyword, setKeyword] = useState("");

  const [statusFilter, setStatusFilter] = useState("");



  // =============================
  // STATUS
  // =============================


  const statusColors = {

    ACTIVE: "green",

    HIDDEN: "red",

  };



  // =============================
  // FETCH
  // =============================


  const fetchReviews = async (status = "") => {

    try {

      setLoading(true);


      const params = {};


      if(status){

        params.status = status;

      }


      const res = await reviewService.getAll(params);

const page =
    res?.content ||
    res?.data?.content ||
    [];

const data = page.map((r) => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    rating: r.rating,
    title: r.title,
    comment: r.content,
    photos: r.photos || [],
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
}));

setReviews(data);



    }catch(error){

      console.error(error);

      message.error(
        "Không thể tải danh sách đánh giá"
      );


    }finally{

      setLoading(false);

    }

  };




  useEffect(()=>{

    fetchReviews();

  },[]);




  // =============================
  // HIDE REVIEW
  // =============================


  const hideReview = async(id)=>{


    try{


      await reviewService.hide(id);


      message.success(
        "Đã ẩn đánh giá"
      );


      fetchReviews(statusFilter);



    }catch(error){


      console.error(error);


      message.error(
        "Ẩn đánh giá thất bại"
      );


    }

  };

const showReview = async (id) => {
  console.log("Show id:", id);

  try {
    await reviewService.show(id);
    message.success("Đã hiển thị đánh giá");
    fetchReviews(statusFilter);
  } catch (error) {
    console.error(error);
  }
};



  // =============================
  // SEARCH
  // =============================


  const filteredReviews = reviews.filter((r)=>{


    const text = (

      `${r.title || ""} 
      ${r.comment || ""} 
      ${r.userId || ""} 
      ${r.productId || ""}`

    ).toLowerCase();



    return text.includes(
      keyword.toLowerCase()
    );


  });





  // =============================
  // TABLE
  // =============================


  const columns = [

    {

      title:"Sản phẩm",

      dataIndex:"productId",

      key:"productId",

      width:180,

      ellipsis:true,

    },


    {

      title:"Người dùng",

      dataIndex:"userId",

      key:"userId",

      width:180,

      ellipsis:true,

    },


    {

      title:"Đánh giá",

      dataIndex:"rating",

      key:"rating",

      align:"center",

      render:(rating)=>(

        <span>

          ⭐ {rating}/5

        </span>

      ),

    },


    {

      title:"Tiêu đề",

      dataIndex:"title",

      key:"title",

      ellipsis:true,

    },


    {

      title:"Trạng thái",

      dataIndex:"status",

      key:"status",

      render:(status)=>(

        <Tag
          color={
            statusColors[status] || "default"
          }
        >

          {status}

        </Tag>

      ),

    },


    {

      title:"Ngày tạo",

      dataIndex:"createdAt",

      key:"createdAt",

      render:(value)=>(

        value
        ?
        new Date(value)
        .toLocaleString("vi-VN")
        :
        ""

      ),

    },


    {


      title:"Hành động",

      key:"action",

      align:"center",


      render:(_,record)=>(


        <Space>


          <Tooltip title="Xem chi tiết">

            <Button

              type="text"

              icon={<EyeOutlined />}


              onClick={()=>{


                setSelectedReview(record);

                setDrawerOpen(true);


              }}

            />

          </Tooltip>




          {
  record.status === "ACTIVE" ? (

    <Popconfirm
      title="Ẩn đánh giá này?"
      onConfirm={() => hideReview(record.id)}
    >
      <Tooltip title="Ẩn đánh giá">
        <Button
          danger
          type="text"
          icon={<EyeInvisibleOutlined />}
        />
      </Tooltip>
    </Popconfirm>

  ) : (

    <Popconfirm
      title="Hiển thị lại đánh giá?"
      onConfirm={() => showReview(record.id)}
    >
      <Tooltip title="Hiển thị đánh giá">
        <Button
          type="text"
          icon={<EyeOutlined />}
        />
      </Tooltip>
    </Popconfirm>

  )
}



        </Space>


      )


    }


  ];






  return (

    <div className="review-management">


      <h2>

        Quản lý đánh giá sản phẩm

      </h2>




      <div

        style={{

          display:"flex",

          gap:12,

          marginBottom:20,

        }}

      >



        <Input

          placeholder="Tìm kiếm..."

          style={{
            width:260
          }}

          value={keyword}

          onChange={
            e=>setKeyword(e.target.value)
          }

        />




        <Select

          placeholder="Trạng thái"

          style={{
            width:180
          }}

          allowClear


          value={statusFilter || undefined}


          onChange={(value)=>{


            const status=value || "";


            setStatusFilter(status);


            fetchReviews(status);



          }}

        >


          <Option value="ACTIVE">

            ACTIVE

          </Option>


          <Option value="HIDDEN">

            HIDDEN

          </Option>



        </Select>



      </div>





      <Table

        rowKey="id"

        loading={loading}

        columns={columns}

        dataSource={filteredReviews}


        pagination={{

          pageSize:10

        }}


      />







      <Drawer

        width={700}

        title="Chi tiết đánh giá"

        open={drawerOpen}

        onClose={()=>setDrawerOpen(false)}

      >


        {
          selectedReview && (


            <Descriptions

              bordered

              column={1}

              size="small"

            >


              <Descriptions.Item label="ID">

                {selectedReview.id}

              </Descriptions.Item>



              <Descriptions.Item label="Product">

                {selectedReview.productId}

              </Descriptions.Item>



              <Descriptions.Item label="User">

                {selectedReview.userId}

              </Descriptions.Item>



              <Descriptions.Item label="Rating">

                ⭐ {selectedReview.rating}/5

              </Descriptions.Item>



              <Descriptions.Item label="Tiêu đề">

                {selectedReview.title}

              </Descriptions.Item>



              <Descriptions.Item label="Nội dung">

                {selectedReview.comment}

              </Descriptions.Item>




              <Descriptions.Item label="Trạng thái">


                <Tag

                  color={
                    statusColors[selectedReview.status]
                  }

                >

                  {selectedReview.status}

                </Tag>


              </Descriptions.Item>



              <Descriptions.Item label="Ngày tạo">

                {
                  selectedReview.createdAt
                  ?
                  new Date(
                    selectedReview.createdAt
                  )
                  .toLocaleString("vi-VN")
                  :
                  ""
                }


              </Descriptions.Item>



            </Descriptions>


          )

        }


      </Drawer>



    </div>

  );


}