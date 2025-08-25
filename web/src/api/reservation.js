// 模拟API调用函数

// 创建个人预约
export const createIndividualReservation = async (data) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟成功响应
    return {
      _status: 'OK',
      data: {
        message: '个人预约申请提交成功！请等待审核结果。',
        reservationId: Math.floor(Math.random() * 10000)
      }
    }
  } catch (error) {
    throw new Error('提交失败，请稍后重试')
  }
}

// 创建团体预约
export const createGroupReservation = async (data) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟成功响应
    return {
      _status: 'OK',
      data: {
        message: '团体预约申请提交成功！请等待审核结果。',
        reservationId: Math.floor(Math.random() * 10000)
      }
    }
  } catch (error) {
    throw new Error('提交失败，请稍后重试')
  }
}

// 查询预约状态
export const getReservationStatus = async (reservationId) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟响应数据
    const statuses = ['pending', 'approved', 'rejected']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      _status: 'OK',
      data: {
        reservationId,
        status: randomStatus,
        message: `预约状态：${randomStatus === 'pending' ? '待审核' : randomStatus === 'approved' ? '已通过' : '已拒绝'}`
      }
    }
  } catch (error) {
    throw new Error('查询失败，请稍后重试')
  }
}